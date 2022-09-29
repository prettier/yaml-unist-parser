import { createDocument } from "../factories/document";
import { createPosition } from "../factories/position";
import { Context } from "../transform";
import { Document } from "../types";
import * as YAML from "../yaml";
import { transformDocumentBody } from "./document-body";
import { transformDocumentHead } from "./document-head";

export function transformDocument(
  document: YAML.ast.Document,
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

  return createDocument(
    createPosition(documentHead.position.start, documentEndPoint),
    documentHead,
    documentBody,
    documentTrailingComment,
  );
}
