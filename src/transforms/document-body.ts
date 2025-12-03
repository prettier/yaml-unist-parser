import type * as YAML from "yaml";
import * as YAML_CST from "../cst.js";
import { createDocumentBody } from "../factories/document-body.js";
import type { Comment, ContentNode, Point } from "../types.js";
import { extractComments } from "../utils/extract-comments.js";
import { findCharIndex } from "../utils/find-char-index.js";
import { getLast } from "../utils/get-last.js";
import { getPointText } from "../utils/get-point-text.js";
import type Context from "./context.js";

export function transformDocumentBody(
  docStart: YAML_CST.DocStartSourceToken | null,
  tokensBeforeBody: YAML_CST.SourceToken[],
  cstNode: YAML.CST.Document,
  document: YAML.Document.Parsed,
  tokensAfterBody: YAML_CST.SourceToken[],
  docEnd: YAML.CST.DocumentEnd | null,
  context: Context,
) {
  const { documentTrailingComment, endComments, propTokens } = categorizeNodes(
    tokensBeforeBody,
    cstNode,
    tokensAfterBody,
    docEnd,
    context,
  );

  const hasContent =
    document.contents &&
    (document.contents.range[0] < document.contents.range[1] ||
      propTokens.some(
        token => token.type === "tag" || token.type === "anchor",
      ));

  const content = hasContent
    ? context.transformNode(document.contents, { tokens: propTokens })
    : null;

  if (!hasContent) {
    // Handle comments in empty document body
    for (const token of extractComments(propTokens, context)) {
      // istanbul ignore next -- @preserve
      throw new Error(
        `Unexpected token type in empty document body: ${token.type}`,
      );
    }
  }

  const { position, documentEndPoint } = getPosition(
    docStart,
    document,
    content,
    docEnd,
    context,
  );

  return {
    documentBody: createDocumentBody(position, content, endComments),
    documentEndPoint,
    documentTrailingComment,
  };
}

function categorizeNodes(
  tokensBeforeBody: YAML_CST.SourceToken[],
  document: YAML.CST.Document,
  tokensAfterBody: YAML_CST.SourceToken[],
  docEnd: YAML.CST.DocumentEnd | null,
  context: Context,
) {
  const endComments: Comment[] = [];
  const documentTrailingComments: Comment[] = [];
  const propTokens: YAML_CST.ContentPropertyToken[] = [];

  for (const token of tokensBeforeBody) {
    if (YAML_CST.maybeContentPropertyToken(token)) {
      propTokens.push(token);
      continue;
    }
    // istanbul ignore next -- @preserve
    throw new Error(`Unexpected token type: ${token.type}`);
  }
  for (const token of extractComments(tokensAfterBody, context)) {
    // istanbul ignore next -- @preserve
    throw new Error(`Unexpected token type: ${token.type}`);
  }

  const docEndPoint: null | Point = docEnd
    ? context.transformOffset(docEnd.offset)
    : null;
  for (const token of YAML_CST.tokens(document.end, docEnd?.end)) {
    if (token.type === "comment") {
      const comment = context.transformComment(token);
      if (docEndPoint) {
        if (docEndPoint.line === comment.position.start.line) {
          documentTrailingComments.push(comment);
        } else if (comment.position.start.line < docEndPoint.line) {
          endComments.push(comment);
        }
      } else {
        endComments.push(comment);
      }
      continue;
    }
    // istanbul ignore next -- @preserve
    throw new Error(`Unexpected token type: ${token.type}`);
  }

  // istanbul ignore if -- @preserve
  if (documentTrailingComments.length > 1) {
    throw new Error(
      `Unexpected multiple document trailing comments at ${getPointText(
        documentTrailingComments[1].position.start,
      )}`,
    );
  }

  return {
    propTokens,
    endComments,
    documentTrailingComment: getLast(documentTrailingComments) || null,
  };
}

function getPosition(
  docStart: YAML_CST.DocStartSourceToken | null,
  document: YAML.Document.Parsed,
  content: null | ContentNode,
  docEnd: YAML.CST.DocumentEnd | null,
  context: Context,
) {
  let origEnd = docEnd
    ? Math.max(0, docEnd.offset - 1)
    : (findCharIndex(context.text, document.range[2], /\S/u) ??
      context.text.length);

  // CRLF fix
  if (context.text[origEnd - 1] === "\r") {
    origEnd--;
  }

  let origStart = content !== null ? content.position.start.offset : origEnd;
  if (docStart) {
    const docStartEnd = docStart.offset + docStart.source.length + 1;
    if (origStart < docStartEnd && docStartEnd <= origEnd) {
      origStart = docStartEnd;
    }
  }

  const position = context.transformRange({
    origStart,
    origEnd,
  });

  const documentEndPoint = docEnd
    ? context.transformOffset(docEnd.offset + docEnd.source.length)
    : position.end;

  return { position, documentEndPoint };
}
