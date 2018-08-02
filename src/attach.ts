import { Context } from "./transform";
import {
  Comment,
  CommentAttachable,
  Document,
  EndCommentAttachable,
  MappingItem,
  Root,
  YamlUnistNode,
} from "./types";
import {
  defineParent,
  getLast,
  getStartPoint,
  isBlockValue,
  isExplicitMappingItem,
  updateEndPoints,
} from "./utils";

type NodeTable = Array<{
  leadingAttachableNode: null | Extract<YamlUnistNode, CommentAttachable>;
  trailingAttachableNode: null | Extract<YamlUnistNode, CommentAttachable>;
  trailingNode: null | Exclude<YamlUnistNode, null>;
  comment: null | Comment;
}>;

export function attachComments(root: Root, context: Context): void {
  const nodeTable = createNodeTable(root, context);

  const restDocuments = root.children.slice();
  context.comments
    .sort((a, b) => a.position.start.offset - b.position.end.offset)
    .filter(comment => comment.parent === undefined)
    .forEach(comment => {
      while (
        restDocuments.length > 1 &&
        comment.position.start.line > restDocuments[0].position.end.line
      ) {
        restDocuments.shift();
      }
      attachComment(comment, nodeTable, restDocuments[0]);
    });

  updateEndPoints(root);
}

function createNodeTable(root: Root, context: Context) {
  const nodeTable: NodeTable = context.text.split("\n").map(() => ({
    leadingAttachableNode: null,
    trailingAttachableNode: null,
    trailingNode: null,
    comment: null,
  }));

  for (const comment of context.comments) {
    nodeTable[comment.position.start.line - 1].comment = comment;
  }

  initNodeTable(root, nodeTable, context);

  return nodeTable;
}

function initNodeTable(
  node: Exclude<YamlUnistNode, null>,
  nodeTable: NodeTable,
  context: Context,
): void {
  if ("leadingComments" in node) {
    const start = getStartPoint(node);
    const currentStartNode = nodeTable[start.line - 1].leadingAttachableNode;

    if (
      node.type !== "document" &&
      (!currentStartNode ||
        start.column < currentStartNode.position.start.column)
    ) {
      nodeTable[start.line - 1].leadingAttachableNode = node;
    }
  }

  if ("trailingComments" in node) {
    const { end } = node.position;
    const currentEndNode = nodeTable[end.line - 1].trailingAttachableNode;

    if (
      !(
        node.type === "document" &&
        context.text.slice(
          node.position.end.offset - 4,
          node.position.end.offset,
        ) !== "\n..."
      ) &&
      (!currentEndNode || end.column >= currentEndNode.position.end.column)
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
    (node.children as YamlUnistNode[]).forEach(child => {
      if (child !== null) {
        defineParent(child, node);
        initNodeTable(child, nodeTable, context);
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
  if (
    trailingAttachableNode !== null &&
    trailingAttachableNode.type !== "blockFolded" &&
    trailingAttachableNode.type !== "blockLiteral"
  ) {
    defineParent(comment, trailingAttachableNode);
    trailingAttachableNode.trailingComments.push(comment);
    return;
  }

  for (let line = commentLine; line >= document.position.start.line; line--) {
    const { trailingNode } = nodeTable[line - 1];

    let currentNode: Exclude<YamlUnistNode, null>;

    if (trailingNode === null) {
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
      if (line !== commentLine && nodeTable[line - 1].comment !== null) {
        currentNode = nodeTable[line - 1].comment!.parent!;
      } else {
        continue;
      }
    } else {
      currentNode = trailingNode;
    }

    while (true) {
      if (ownEndComment(currentNode, comment)) {
        defineParent(comment, currentNode);
        currentNode.endComments.push(comment);
        return;
      }

      if (currentNode.parent === undefined) {
        break;
      }

      currentNode = currentNode.parent;
    }

    break;
  }

  for (let line = commentLine + 1; line <= document.position.end.line; line++) {
    const { leadingAttachableNode } = nodeTable[line - 1];
    if (leadingAttachableNode !== null) {
      defineParent(comment, leadingAttachableNode);
      leadingAttachableNode.leadingComments.push(comment);
      return;
    }
  }

  defineParent(comment, document.children[1]);
  document.children[1].children.push(comment);
}

function ownEndComment(
  node: Exclude<YamlUnistNode, null>,
  comment: Comment,
): node is Extract<YamlUnistNode, EndCommentAttachable> {
  if (comment.position.end.offset < node.position.end.offset) {
    return false;
  }

  switch (node.type) {
    case "sequence":
      return (
        node.parent!.type !== "documentBody" &&
        comment.position.start.column >= node.position.start.column &&
        comment.position.start.offset >
          getLast(node.children)!.position.end.offset
      );
    case "sequenceItem":
      return comment.position.start.column > node.position.start.column;
    case "mappingValue":
      return (
        comment.position.start.column > node.parent!.position.start.column &&
        !isBlockValue(node.children[0])
      );
    case "mappingKey":
      return (
        comment.position.start.column > node.parent!.position.start.column &&
        !isBlockValue(node.children[0]) &&
        isExplicitMappingItem(node.parent as MappingItem)
      );
    default:
      return false;
  }
}
