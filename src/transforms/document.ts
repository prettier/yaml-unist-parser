import type * as YAML from "yaml";
import * as YAML_CST from "../cst.ts";
import { createDocument } from "../factories/document.ts";
import { createDocumentBody } from "../factories/document-body.ts";
import { createDocumentHead } from "../factories/document-head.ts";
import { createPosition } from "../factories/position.ts";
import type { Document } from "../types.ts";
import { getPointText } from "../utils/get-point-text.ts";
import type Context from "./context.ts";
import { transformDocumentBody } from "./document-body.ts";
import { transformDocumentHead } from "./document-head.ts";

type DocumentData = {
  tokensBeforeBody: (YAML_CST.CommentSourceToken | YAML.CST.Directive)[];
  cstNode: YAML.CST.Document;
  node: YAML.Document.Parsed;
  tokensAfterBody: YAML_CST.CommentSourceToken[];
  docEnd: YAML.CST.DocumentEnd | null;
};

export function transformDocuments(
  documentNodes: YAML.Document.Parsed[],
  cstTokens: YAML.CST.Token[],
  context: Context,
): Document[] {
  let bufferComments: YAML_CST.CommentSourceToken[] = [];
  let tokensBeforeBody: (YAML_CST.CommentSourceToken | YAML.CST.Directive)[] =
    [];
  let currentDoc: DocumentData | null = null;
  const documents: DocumentData[] = [];
  for (const token of YAML_CST.tokens(cstTokens)) {
    if (token.type === "comment") {
      bufferComments.push(token);
      continue;
    }
    if (token.type === "doc-end") {
      // istanbul ignore if -- @preserve
      if (!currentDoc || currentDoc.docEnd)
        throw new Error(
          `Unexpected doc-end token at ${getPointText(context.transformOffset(token.offset))}`,
        );

      currentDoc.tokensAfterBody = [...bufferComments];
      bufferComments = [];

      currentDoc.docEnd = token;
      currentDoc = null;
      continue;
    }
    if (currentDoc) {
      currentDoc = null;
    }
    if (token.type === "directive") {
      tokensBeforeBody.push(...bufferComments, token);
      bufferComments = [];
      continue;
    }
    if (token.type === "document") {
      // istanbul ignore if -- @preserve
      if (documentNodes.length <= documents.length) {
        throw new Error(
          `Unexpected document token at ${getPointText(context.transformOffset(token.offset))}`,
        );
      }
      currentDoc = {
        tokensBeforeBody: [...tokensBeforeBody, ...bufferComments],
        cstNode: token,
        node: documentNodes[documents.length],
        tokensAfterBody: [],
        docEnd: null,
      };
      documents.push(currentDoc);
      tokensBeforeBody = [];
      bufferComments = [];
      continue;
    }
    // istanbul ignore next -- @preserve
    throw new Error(
      `Unexpected token type: ${token.type} at ${getPointText(context.transformOffset(token.offset))}`,
    );
  }
  // istanbul ignore if -- @preserve
  if (documents.length < documentNodes.length) {
    const errorIndex = documentNodes[documents.length].range[0];
    throw new Error(
      `Unexpected document token at ${getPointText(context.transformOffset(errorIndex))}`,
    );
  }
  if (documents.length > 0 && !documents[documents.length - 1].docEnd) {
    // Append buffered comments to the last document
    const lastDoc = documents[documents.length - 1];
    lastDoc.tokensAfterBody.push(...bufferComments);
    bufferComments = [];
  }

  const nodes = documents.map(document => transformDocument(document, context));

  if (bufferComments.length === 0) {
    if (nodes.length === 0) {
      // Create an empty document if there is no document but comments
      const emptyDoc: Document = createDocument(
        createPosition(
          context.transformOffset(0),
          context.transformOffset(context.text.length),
        ),
        false,
        false,
        createDocumentHead(
          createPosition(
            context.transformOffset(0),
            context.transformOffset(context.text.length),
          ),
          [],
          [],
          null,
        ),
        createDocumentBody(
          createPosition(
            context.transformOffset(0),
            context.transformOffset(context.text.length),
          ),
          null,
          [],
        ),
        null,
      );
      return [emptyDoc];
    }
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

function transformDocument(document: DocumentData, context: Context): Document {
  const { documentHead, tokensBeforeBody, docStart } = transformDocumentHead(
    document.tokensBeforeBody,
    document.cstNode,
    document.node,
    context,
  );

  const { documentBody, documentEndPoint, documentTrailingComment } =
    transformDocumentBody(
      docStart,
      tokensBeforeBody,
      document.cstNode,
      document.node,
      document.tokensAfterBody,
      document.docEnd,
      context,
    );

  return createDocument(
    createPosition(documentHead.position.start, documentEndPoint),
    Boolean(docStart),
    Boolean(document.docEnd),
    documentHead,
    documentBody,
    documentTrailingComment,
  );
}
