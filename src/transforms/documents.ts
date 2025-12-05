import type * as YAML from "yaml";
import * as YAML_CST from "../cst.ts";
import type { Document } from "../types.ts";
import { getPointText } from "../utils/get-point-text.ts";
import type Context from "./context.ts";
import { transformDocument } from "./document.ts";

export type DocumentData = {
  tokensBeforeBody: (YAML_CST.CommentSourceToken | YAML.CST.Directive)[];
  cstNode: YAML.CST.Document | null;
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
  const createDocumentData = (cstNode: YAML.CST.Document | null) => {
    const documentData = {
      tokensBeforeBody: [...tokensBeforeBody, ...bufferComments],
      cstNode,
      node: parsedDocuments[documents.length],
      tokensAfterBody: [],
      documentEnd: null,
    };

    documents.push(documentData);
    tokensBeforeBody.length = 0;
    bufferComments.length = 0;
    return documentData;
  };
  for (const token of YAML_CST.tokens(cstTokens)) {
    if (token.type === "document") {
      // istanbul ignore if -- @preserve
      if (documents.length >= parsedDocuments.length) {
        throw new Error(
          `Unexpected 'document' token at ${getPointText(context.transformOffset(token.offset))}`,
        );
      }

      currentDocumentData = createDocumentData(token);

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

  // istanbul ignore if -- @preserve
  if (tokensBeforeBody.length > 0) {
    const [firstToken] = tokensBeforeBody;
    throw new Error(
      `Unexpected '${firstToken.type}' token at ${getPointText(context.transformOffset(firstToken.offset))}`,
    );
  }

  if (bufferComments.length > 0) {
    // If there is no document seen
    if (!currentDocumentData) {
      currentDocumentData = createDocumentData(null);
    }

    // Append buffered comments to the last document
    if (bufferComments.length > 0) {
      currentDocumentData.tokensAfterBody.push(...bufferComments);
      bufferComments.length = 0;
    }
  }

  const nodes = documents.map(document => transformDocument(document, context));

  return nodes;
}
