import {
  Comment,
  Document,
  DocumentBody,
  DocumentHead,
  Position,
} from "../types";
import { createNode } from "./node";
import { createTrailingCommentAttachable } from "./trailing-comment-attachable";

export function createDocument(
  position: Position,
  head: DocumentHead,
  body: DocumentBody,
  trailingComments: Comment[],
): Document {
  return {
    ...createNode("document", position),
    ...createTrailingCommentAttachable(trailingComments),
    children: [head, body],
  };
}
