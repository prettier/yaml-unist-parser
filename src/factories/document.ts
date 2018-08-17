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
  trailingComment: null | Comment,
): Document {
  return {
    ...createNode("document", position),
    ...createTrailingCommentAttachable(trailingComment),
    children: [head, body],
  };
}
