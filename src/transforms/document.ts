import type * as YAML from "yaml";
import { createDocument } from "../factories/document.js";
import { createPosition } from "../factories/position.js";
import { type Document } from "../types.js";
import type Context from "./context.js";
import { transformDocumentBody } from "./document-body.js";
import { transformDocumentHead } from "./document-head.js";

export function transformDocument(
  document: YAML.Document,
  context: Context,
): Document {
  const { createDocumentHeadWithTrailingComment, documentHeadEndMarkerPoint } =
    transformDocumentHead(document, context);

  const {
    documentBody,
    documentEndPoint,
    documentTrailingComment,
    documentHeadTrailingComment,
  } = transformDocumentBody(document, context, documentHeadEndMarkerPoint);

  const documentHead = createDocumentHeadWithTrailingComment(
    documentHeadTrailingComment,
  );

  if (documentTrailingComment) {
    context.comments.push(documentTrailingComment);
  }

  const cstNode = document.cstNode!;

  return createDocument(
    createPosition(documentHead.position.start, documentEndPoint),
    Boolean(cstNode.directivesEndMarker),
    Boolean(cstNode.documentEndMarker),
    documentHead,
    documentBody,
    documentTrailingComment,
  );
}
