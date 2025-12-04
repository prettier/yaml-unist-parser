import {
  type Comment,
  type Document,
  type DocumentBody,
  type DocumentHead,
  type Position,
} from "../types.ts";

export function createDocument(
  position: Position,
  directivesEndMarker: boolean,
  documentEndMarker: boolean,
  head: DocumentHead,
  body: DocumentBody,
  trailingComment: null | Comment,
): Document {
  return {
    type: "document",
    position,
    trailingComment,
    directivesEndMarker,
    documentEndMarker,
    children: [head, body],
  };
}
