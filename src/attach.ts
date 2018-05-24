import { Context } from "./transform";
import {
  Comment,
  CommentAttachable,
  Document,
  Root,
  YamlUnistNode,
} from "./types";
import { defineCommentParent } from "./utils";

type NodeTable = Array<{
  leadingNode: null | Extract<YamlUnistNode, CommentAttachable>;
  trailingNode: null | Extract<YamlUnistNode, CommentAttachable>;
}>;

export function attachComments(root: Root, context: Context): void {
  const nodeTable: NodeTable = context.text.split("\n").map(() => ({
    leadingNode: null,
    trailingNode: null,
  }));

  initNodeTable(root, nodeTable);

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
}

function initNodeTable(node: YamlUnistNode, nodeTable: NodeTable): void {
  if ("leadingComments" in node) {
    const { start, end } = node.position;

    const currentStartNode = nodeTable[start.line - 1].leadingNode;
    const currentEndNode = nodeTable[end.line - 1].trailingNode;

    if (
      !currentStartNode ||
      node.position.start.column < currentStartNode.position.start.column
    ) {
      nodeTable[start.line - 1].leadingNode = node;
    }

    if (
      !currentEndNode ||
      node.position.end.column >= currentEndNode.position.end.column
    ) {
      nodeTable[end.line - 1].trailingNode = node;
    }
  }

  if ("children" in node) {
    (node.children as YamlUnistNode[]).forEach(child =>
      initNodeTable(child, nodeTable),
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