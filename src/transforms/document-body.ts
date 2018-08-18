import YAML from "yaml";
import { createDocumentBody } from "../factories/document-body";
import { Context } from "../transform";
import { Comment, ContentNode, Point } from "../types";
import { getLast } from "../utils/get-last";
import { getMatchIndex } from "../utils/get-match-index";
import { getPointText } from "../utils/get-point-text";
import { Range } from "./range";

export function transformDocumentBody(
  document: YAML.ast.Document,
  context: Context,
  headEndMarkerPoint: null | Point,
) {
  const cstNode = document.cstNode!;

  const {
    comments,
    endComments,
    documentTrailingComment,
    documentHeadTrailingComment,
  } = categorizeNodes(cstNode, context, headEndMarkerPoint);

  const content = context.transformNode(document.contents);
  const position = getPosition(cstNode, content, context);

  context.comments.push(...comments, ...endComments);

  return {
    documentBody: createDocumentBody(position, [content], endComments),
    documentTrailingComment,
    documentHeadTrailingComment,
  };
}

function categorizeNodes(
  document: YAML.cst.Document,
  context: Context,
  headEndMarkerPoint: null | Point,
) {
  const comments: Comment[] = [];
  const endComments: Comment[] = [];
  const documentTrailingComments: Comment[] = [];
  const documentHeadTrailingComments: Comment[] = [];

  let hasContent = false;
  for (let i = document.contents.length - 1; i >= 0; i--) {
    const node = document.contents[i];
    if (node.type === "COMMENT") {
      const comment = context.transformNode(node);
      if (
        headEndMarkerPoint &&
        headEndMarkerPoint.line === comment.position.start.line
      ) {
        documentHeadTrailingComments.unshift(comment);
      } else if (hasContent) {
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

  // istanbul ignore next
  if (documentTrailingComments.length > 1) {
    throw new Error(
      `Unexpected multiple document trailing comments at ${getPointText(
        documentTrailingComments[1].position.start,
      )}`,
    );
  }

  // istanbul ignore next
  if (documentHeadTrailingComments.length > 1) {
    throw new Error(
      `Unexpected multiple documentHead trailing comments at ${getPointText(
        documentHeadTrailingComments[1].position.start,
      )}`,
    );
  }

  return {
    comments,
    endComments,
    documentTrailingComment: getLast(documentTrailingComments) || null,
    documentHeadTrailingComment: getLast(documentHeadTrailingComments) || null,
  };
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
