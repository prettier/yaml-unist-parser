import {
  type Comment,
  type Document,
  type DocumentBody,
  type DocumentHead,
  type Position,
} from "../types.js";
import { createNode } from "./node.js";
import { createTrailingCommentAttachable } from "./trailing-comment-attachable.js";

export function createDocument(
  position: Position,
  startMark: boolean,
  endMark: boolean,
  head: DocumentHead,
  body: DocumentBody,
  trailingComment: null | Comment,
): Document {
  return {
    ...createNode("document", position),
    ...createTrailingCommentAttachable(trailingComment),
    startMark,
    endMark,
    children: [head, body],
  };
}
