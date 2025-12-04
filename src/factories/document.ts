import {
  type Comment,
  type Document,
  type DocumentBody,
  type DocumentHead,
  type Position,
} from "../types.ts";

import { createTrailingCommentAttachable } from "./trailing-comment-attachable.ts";

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
    position: position,
    ...createTrailingCommentAttachable(trailingComment),
    directivesEndMarker,
    documentEndMarker,
    children: [head, body],
  };
}
