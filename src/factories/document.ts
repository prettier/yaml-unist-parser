import {
  Comment,
  Document,
  DocumentBody,
  DocumentHead,
  Position,
} from "../types.js";
import { createNode } from "./node.js";
import { createTrailingCommentAttachable } from "./trailing-comment-attachable.js";

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
