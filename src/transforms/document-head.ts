import type * as YAML from "yaml";
import { createDocumentHead } from "../factories/document-head.js";
import type { Comment, Directive, Range } from "../types.js";
import { getMatchIndex } from "../utils/get-match-index.js";
import type Context from "./context.js";

export function transformDocumentHead(
  document: YAML.Document,
  context: Context,
) {
  const cstNode = document.cstNode!;

  const { directives, comments, endComments } = categorizeNodes(
    cstNode,
    context,
  );

  const { position, documentEndMarkererPoint } = getPosition(
    cstNode,
    directives,
    context,
  );

  context.comments.push(...comments, ...endComments);

  const createDocumentHeadWithTrailingComment = (
    trailingComment: null | Comment,
  ) => {
    if (trailingComment) {
      context.comments.push(trailingComment);
    }
    return createDocumentHead(
      position,
      directives,
      endComments,
      trailingComment,
    );
  };

  return {
    createDocumentHeadWithTrailingComment,
    documentHeadEndMarkerPoint: documentEndMarkererPoint,
  };
}

function categorizeNodes(document: YAML.CST.Document, context: Context) {
  const directives: Directive[] = [];
  const comments: Comment[] = [];
  const endComments: Comment[] = [];

  let hasDirective = false;
  for (let i = document.directives.length - 1; i >= 0; i--) {
    const node = context.transformNode(document.directives[i]);
    if (node.type === "comment") {
      if (hasDirective) {
        comments.unshift(node);
      } else {
        endComments.unshift(node);
      }
    } else {
      hasDirective = true;
      directives.unshift(node);
    }
  }

  return { directives, comments, endComments };
}

function getPosition(
  document: YAML.CST.Document,
  directives: Directive[],
  context: Context,
) {
  let documentEndMarkererIndex = getMatchIndex(
    context.text.slice(0, document.valueRange!.origStart),
    /---\s*$/,
  );
  // end marker should start with the first character on the line
  if (
    documentEndMarkererIndex > 0 &&
    !/[\r\n]/.test(context.text[documentEndMarkererIndex - 1])
  ) {
    documentEndMarkererIndex = -1;
  }

  const range: Range =
    documentEndMarkererIndex === -1
      ? {
          origStart: document.valueRange!.origStart!,
          origEnd: document.valueRange!.origStart!,
        }
      : {
          origStart: documentEndMarkererIndex!,
          origEnd: documentEndMarkererIndex + 3,
        };

  if (directives.length !== 0) {
    range.origStart = directives[0].position.start.offset;
  }

  return {
    position: context.transformRange(range),
    documentEndMarkererPoint:
      documentEndMarkererIndex === -1
        ? null
        : context.transformOffset(documentEndMarkererIndex),
  };
}
