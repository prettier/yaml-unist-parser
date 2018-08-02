import { Document, DocumentBody, DocumentHead, Position } from "../types";
import { createCommentAttachable } from "./comment-attachable";
import { createNode } from "./node";

export function createDocument(
  position: Position,
  head: DocumentHead,
  body: DocumentBody,
): Document {
  return {
    ...createNode("document", position),
    ...createCommentAttachable(),
    children: [head, body],
  };
}
