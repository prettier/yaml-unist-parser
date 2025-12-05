import type * as YAML from "yaml";
import * as YAML_CST from "../cst.ts";
import { createDocument } from "../factories/document.ts";
import { createDocumentBody } from "../factories/document-body.ts";
import { createDocumentHead } from "../factories/document-head.ts";
import { createPosition } from "../factories/position.ts";
import type { Document } from "../types.ts";
import { getPointText } from "../utils/get-point-text.ts";
import type Context from "./context.ts";
import { transformDocument } from "./document.ts";

export type DocumentData = {
  tokensBeforeBody: (YAML_CST.CommentSourceToken | YAML.CST.Directive)[];
  cstNode: YAML.CST.Document;
  node: YAML.Document.Parsed;
  tokensAfterBody: YAML_CST.CommentSourceToken[];
  documentEnd: YAML.CST.DocumentEnd | null;
};

export function transformDocuments(
  parsedDocuments: YAML.Document.Parsed[],
  cstTokens: YAML.CST.Token[],
  context: Context,
): Document[] {
  if (parsedDocuments.length === 0) {
    return [];
  }

  const documents: DocumentData[] = [];

  const bufferComments: YAML_CST.CommentSourceToken[] = [];
  const tokensBeforeBody: (YAML_CST.CommentSourceToken | YAML.CST.Directive)[] =
    [];
  let currentDocumentData: DocumentData | null = null;
  for (const token of YAML_CST.tokens(cstTokens)) {
    if (token.type === "document") {
      // istanbul ignore if -- @preserve
      if (parsedDocuments.length <= documents.length) {
        throw new Error(
          `Unexpected 'document' token at ${getPointText(context.transformOffset(token.offset))}`,
        );
      }

      currentDocumentData = {
        tokensBeforeBody: [...tokensBeforeBody, ...bufferComments],
        cstNode: token,
        node: parsedDocuments[documents.length],
        tokensAfterBody: [],
        documentEnd: null,
      };

      documents.push(currentDocumentData);
      tokensBeforeBody.length = 0;
      bufferComments.length = 0;
      continue;
    }

    if (token.type === "comment") {
      bufferComments.push(token);
      continue;
    }

    if (token.type === "directive") {
      tokensBeforeBody.push(...bufferComments, token);
      bufferComments.length = 0;
      continue;
    }

    if (token.type === "doc-end") {
      // istanbul ignore if -- @preserve
      if (!currentDocumentData || currentDocumentData.documentEnd) {
        throw new Error(
          `Unexpected 'doc-end' token at ${getPointText(context.transformOffset(token.offset))}`,
        );
      }

      currentDocumentData!.tokensAfterBody = [...bufferComments];
      bufferComments.length = 0;
      currentDocumentData!.documentEnd = token;
      continue;
    }
  }

  // Append buffered comments to the last document
  if (currentDocumentData && !currentDocumentData.documentEnd) {
    currentDocumentData.tokensAfterBody.push(...bufferComments);
    bufferComments.length = 0;
  }

  const nodes = documents.map(document => transformDocument(document, context));

  if (bufferComments.length === 0) {
    return nodes;
  }

  // Append remaining comments as a new document
  const firstComment = bufferComments[0];
  const commentDoc: Document = createDocument(
    createPosition(
      context.transformOffset(firstComment.offset),
      context.transformOffset(context.text.length),
    ),
    false,
    false,
    createDocumentHead(
      createPosition(
        context.transformOffset(firstComment.offset),
        context.transformOffset(firstComment.offset),
      ),
      [],
      [],
      null,
    ),
    createDocumentBody(
      createPosition(
        context.transformOffset(firstComment.offset),
        context.transformOffset(context.text.length),
      ),
      null,
      bufferComments.map(token => context.transformComment(token)),
    ),
    null,
  );
  return [...nodes, commentDoc];
}
