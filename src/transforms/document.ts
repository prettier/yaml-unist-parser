import { createDocument } from "../factories/document.ts";
import { createPosition } from "../factories/position.ts";
import type { Document } from "../types.ts";
import type Context from "./context.ts";
import { transformDocumentBody } from "./document-body.ts";
import { transformDocumentHead } from "./document-head.ts";
import { type DocumentData } from "./documents.ts";

export function transformDocument(
  document: DocumentData,
  context: Context,
): Document {
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
      document.documentEnd,
      context,
    );

  return createDocument(
    createPosition(documentHead.position.start, documentEndPoint),
    Boolean(docStart),
    Boolean(document.documentEnd),
    documentHead,
    documentBody,
    documentTrailingComment,
  );
}
