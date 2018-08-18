import {
  Comment,
  Document,
  EndCommentAttachable,
  LeadingCommentAttachable,
  Root,
  TrailingCommentAttachable,
  YamlUnistNode,
} from "./types";
import { defineParents } from "./utils/define-parents";
import { getPointText } from "./utils/get-point-text";

interface NodeTable {
  [line: number]: {
    leadingAttachableNode?: Extract<YamlUnistNode, LeadingCommentAttachable>;
    trailingAttachableNode?: Extract<YamlUnistNode, TrailingCommentAttachable>;
    trailingNode?: Exclude<YamlUnistNode, null>;
    comment?: Comment;
  };
}

export function attachComments(root: Root): void {
  defineParents(root);

  const nodeTable = createNodeTable(root);

  const restDocuments = root.children.slice();
  root.comments
    .sort((a, b) => a.position.start.offset - b.position.end.offset)
    .filter(comment => !comment._parent)
    .forEach(comment => {
      while (
        restDocuments.length > 1 &&
        comment.position.start.line > restDocuments[0].position.end.line
      ) {
        restDocuments.shift();
      }
      attachComment(comment, nodeTable, restDocuments[0]);
    });
}

function createNodeTable(root: Root) {
  const nodeTable: NodeTable = Array.from(
    new Array(root.position.end.line),
    () => ({}),
  );

  for (const comment of root.comments) {
    nodeTable[comment.position.start.line - 1].comment = comment;
  }

  initNodeTable(nodeTable, root);

  return nodeTable;
}

function initNodeTable(nodeTable: NodeTable, node: YamlUnistNode): void {
  if (
    node === null ||
    // empty mappingKey/mappingValue
    node.position.start.offset === node.position.end.offset
  ) {
    return;
  }

  if ("leadingComments" in node) {
    const { start } = node.position;
    const { leadingAttachableNode } = nodeTable[start.line - 1];

    if (
      !leadingAttachableNode ||
      start.column < leadingAttachableNode.position.start.column
    ) {
      nodeTable[start.line - 1].leadingAttachableNode = node;
    }
  }

  if (
    "trailingComment" in node &&
    node.position.end.column > 1 &&
    node.type !== "document" &&
    node.type !== "documentHead"
  ) {
    const { end } = node.position;
    const { trailingAttachableNode } = nodeTable[end.line - 1];

    if (
      !trailingAttachableNode ||
      end.column >= trailingAttachableNode.position.end.column
    ) {
      nodeTable[end.line - 1].trailingAttachableNode = node;
    }
  }

  if (
    node.type !== "root" &&
    node.type !== "document" &&
    node.type !== "documentHead" &&
    node.type !== "documentBody"
  ) {
    const { start, end } = node.position;
    const lines = [end.line].concat(start.line === end.line ? [] : start.line);

    for (const line of lines) {
      const currentEndNode = nodeTable[line - 1].trailingNode;
      if (!currentEndNode || end.column >= currentEndNode.position.end.column) {
        nodeTable[line - 1].trailingNode = node;
      }
    }
  }

  if ("children" in node) {
    (node.children as Array<(typeof node.children)[number]>).forEach(child => {
      if (child !== null) {
        initNodeTable(nodeTable, child);
      }
    });
  }
}

function attachComment(
  comment: Comment,
  nodeTable: NodeTable,
  document: Document,
) {
  const commentLine = comment.position.start.line;

  const { trailingAttachableNode } = nodeTable[commentLine - 1];
  if (trailingAttachableNode) {
    // istanbul ignore next
    if (trailingAttachableNode.trailingComment) {
      throw new Error(
        `Unexpected multiple trailing comment at ${getPointText(
          comment.position.start,
        )}`,
      );
    }

    defineParents(comment, trailingAttachableNode);
    trailingAttachableNode.trailingComment = comment;
    return;
  }

  for (let line = commentLine; line >= document.position.start.line; line--) {
    const { trailingNode } = nodeTable[line - 1];

    let currentNode: Exclude<YamlUnistNode, null>;

    if (!trailingNode) {
      /**
       * a:
       *   b:
       *    #b
       *  #a
       *
       * a:
       *   b:
       *  #a
       *    #a
       */
      if (line !== commentLine && nodeTable[line - 1].comment) {
        currentNode = nodeTable[line - 1].comment!._parent!;
      } else {
        continue;
      }
    } else {
      currentNode = trailingNode;
    }

    while (true) {
      if (shouldOwnEndComment(currentNode, comment)) {
        defineParents(comment, currentNode);
        currentNode.endComments.push(comment);
        return;
      }

      if (!currentNode._parent) {
        break;
      }

      currentNode = currentNode._parent;
    }

    break;
  }

  for (let line = commentLine + 1; line <= document.position.end.line; line++) {
    const { leadingAttachableNode } = nodeTable[line - 1];
    if (leadingAttachableNode) {
      defineParents(comment, leadingAttachableNode);
      leadingAttachableNode.leadingComments.push(comment);
      return;
    }
  }

  const documentBody = document.children[1];
  defineParents(comment, documentBody);
  documentBody.endComments.push(comment);
}

function shouldOwnEndComment(
  node: Exclude<YamlUnistNode, null>,
  comment: Comment,
): node is Extract<YamlUnistNode, EndCommentAttachable> {
  if (comment.position.end.offset < node.position.end.offset) {
    return false;
  }

  switch (node.type) {
    case "sequenceItem":
      return comment.position.start.column > node.position.start.column;
    case "mappingKey":
    case "mappingValue":
      return (
        comment.position.start.column > node._parent!.position.start.column &&
        node.children[0] !== null &&
        node.children[0]!.type !== "blockFolded" &&
        node.children[0]!.type !== "blockLiteral" &&
        (node.type === "mappingValue" ||
          // explicit key
          node.position.start.offset !==
            node.children[0]!.position.start.offset)
      );
    default:
      return false;
  }
}
