import YAML from "yaml";
import { createDocumentBody } from "../factories/document-body";
import { Context } from "../transform";
import { Comment, ContentNode } from "../types";
import { getMatchIndex } from "../utils/get-match-index";
import { Range } from "./range";

export function transformDocumentBody(
  document: YAML.ast.Document,
  context: Context,
) {
  const cstNode = document.cstNode!;

  const { comments, endComments, documentTrailingComments } = categorizeNodes(
    cstNode,
    context,
  );

  const content = context.transformNode(document.contents);
  const position = getPosition(cstNode, content, context);

  context.comments.push(...comments, ...endComments);

  return {
    documentBody: createDocumentBody(position, [content], endComments),
    documentTrailingComments,
  };
}

function categorizeNodes(document: YAML.cst.Document, context: Context) {
  const comments: Comment[] = [];
  const endComments: Comment[] = [];
  const documentTrailingComments: Comment[] = [];

  let hasContent = false;
  for (let i = document.contents.length - 1; i >= 0; i--) {
    const node = document.contents[i];
    if (node.type === "COMMENT") {
      const comment = context.transformNode(node);
      if (hasContent) {
        comments.unshift(comment);
      } else if (comment.position.start.offset >= document.valueRange!.end) {
        documentTrailingComments.unshift(comment);
      } else {
        endComments.unshift(comment);
      }
    } else {
      hasContent = true;
    }
  }

  return { comments, endComments, documentTrailingComments };
}

function getPosition(
  document: YAML.cst.Document,
  content: ContentNode,
  context: Context,
) {
  const markerIndex = getMatchIndex(
    context.text.slice(document.valueRange!.end),
    /^\.\.\./,
  );

  const range: Range = {
    start: document.valueRange!.end,
    end: document.valueRange!.end + (markerIndex === -1 ? 0 : 3),
  };

  if (content !== null) {
    range.start = content.position.start.offset;
  }

  return context.transformRange(range);
}
