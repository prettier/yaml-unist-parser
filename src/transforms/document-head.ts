import YAML from "yaml";
import { createDocumentHead } from "../factories/document-head";
import { Context } from "../transform";
import { Comment, Directive } from "../types";
import { getMatchIndex } from "../utils/get-match-index";
import { Range } from "./range";

export function transformDocumentHead(
  document: YAML.ast.Document,
  context: Context,
) {
  const cstNode = document.cstNode!;

  const { directives, comments, endComments } = categorizeNodes(
    cstNode,
    context,
  );

  const { position, endMarkerPoint } = getPosition(
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
    documentHeadEndMarkerPoint: endMarkerPoint,
  };
}

function categorizeNodes(document: YAML.cst.Document, context: Context) {
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
  document: YAML.cst.Document,
  directives: Directive[],
  context: Context,
) {
  const endMarkerIndex = getMatchIndex(
    context.text.slice(0, document.valueRange!.start),
    /---\s*$/,
  );

  const range: Range =
    endMarkerIndex === -1
      ? {
          start: document.valueRange!.start,
          end: document.valueRange!.start,
        }
      : {
          start: endMarkerIndex,
          end: endMarkerIndex + 3,
        };

  if (directives.length !== 0) {
    range.start = directives[0].position.start.offset;
  }

  return {
    position: context.transformRange(range),
    endMarkerPoint:
      endMarkerIndex === -1 ? null : context.transformOffset(endMarkerIndex),
  };
}
