import { Context } from "./transform";
import {
  Comment,
  CommentAttachable,
  Document,
  EndCommentAttachable,
  MappingItem,
  MappingKey,
  MappingValue,
  Root,
  Sequence,
  SequenceItem,
  YamlUnistNode,
} from "./types";
import {
  defineCommentParent,
  getLast,
  getStartPoint,
  isBlockValue,
  isExplicitMappingItem,
  updateEndPoints,
} from "./utils";

type NodeTable = Array<{
  leadingNode: null | Extract<YamlUnistNode, CommentAttachable>;
  trailingNode: null | Extract<YamlUnistNode, CommentAttachable>;
  collectionNode: null | {
    node: SequenceItem | MappingKey | MappingValue;
    column: number;
    cases: NodeTableCollectionNodeCase[];
  };
}>;

interface NodeTableCollectionNodeCase {
  mode: "gt" | "gte";
  attachee: Extract<YamlUnistNode, EndCommentAttachable>;
}

export function attachComments(root: Root, context: Context): void {
  const nodeTable: NodeTable = context.text.split("\n").map(() => ({
    leadingNode: null,
    trailingNode: null,
    collectionNode: null,
  }));

  initNodeTable(root, nodeTable, context);

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

function initNodeTable(
  node: YamlUnistNode,
  nodeTable: NodeTable,
  context: Context,
  parentStack: YamlUnistNode[] = [],
): void {
  if ("leadingComments" in node) {
    const start = getStartPoint(node);
    const { end } = node.position;

    const currentStartNode = nodeTable[start.line - 1].leadingNode;
    const currentEndNode = nodeTable[end.line - 1].trailingNode;

    if (
      node.type !== "document" &&
      (!currentStartNode ||
        start.column < currentStartNode.position.start.column)
    ) {
      nodeTable[start.line - 1].leadingNode = node;
    }

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
      nodeTable[end.line - 1].trailingNode = node;
    }
  }

  const parent = getLast(parentStack);

  if (
    node.type === "sequenceItem" ||
    ((node.type === "mappingValue" ||
      (node.type === "mappingKey" &&
        isExplicitMappingItem(parent as MappingItem))) &&
      !isBlockValue(node.children[0]))
  ) {
    const column =
      node.type === "mappingValue" &&
      !isExplicitMappingItem(parent as MappingItem)
        ? parent!.position.start.column
        : node.position.start.column;

    const cases: NodeTableCollectionNodeCase[] = [
      { mode: "gt", attachee: node },
    ];

    if (node.type === "sequenceItem") {
      const parentParent = parentStack[parentStack.length - 2];
      if (parentParent.type !== "documentBody") {
        const sequence = parent as Sequence;
        if (node === getLast(sequence.children)) {
          cases.push({ mode: "gte", attachee: sequence });
        }
      }
    }

    nodeTable[node.position.start.line - 1].collectionNode = {
      node,
      column,
      cases,
    };
  }

  if ("children" in node) {
    (node.children as YamlUnistNode[]).forEach(child =>
      initNodeTable(child, nodeTable, context, parentStack.concat(node)),
    );
  }
}

function attachComment(
  comment: Comment,
  nodeTable: NodeTable,
  document: Document,
) {
  const commentLine = comment.position.start.line;

  const trailingNode = nodeTable[commentLine - 1].trailingNode;
  if (
    trailingNode !== null &&
    trailingNode.type !== "blockFolded" &&
    trailingNode.type !== "blockLiteral"
  ) {
    defineCommentParent(comment, trailingNode);
    trailingNode.trailingComments.push(comment);
    return;
  }

  for (let line = commentLine; line >= document.position.start.line; line--) {
    const { collectionNode } = nodeTable[line - 1];

    if (collectionNode === null) {
      continue;
    }

    const { cases, node, column } = collectionNode;

    for (const { mode, attachee } of cases) {
      if (
        node.position.end.offset <= comment.position.start.offset &&
        column + (mode === "gt" ? 1 : 0) <= comment.position.start.column
      ) {
        defineCommentParent(comment, attachee);
        attachee.endComments.push(comment);
        return;
      }
    }

    break;
  }

  for (let line = commentLine + 1; line <= document.position.end.line; line++) {
    const leadingNode = nodeTable[line - 1].leadingNode;
    if (leadingNode !== null) {
      defineCommentParent(comment, leadingNode);
      leadingNode.leadingComments.push(comment);
      return;
    }
  }

  defineCommentParent(comment, document.children[1]);
  document.children[1].children.push(comment);
}
