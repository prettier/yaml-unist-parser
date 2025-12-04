import {
  type Comment,
  type Directive,
  type DocumentHead,
  type Position,
} from "../types.ts";
import { createTrailingCommentAttachable } from "./trailing-comment-attachable.ts";

export function createDocumentHead(
  position: Position,
  children: Directive[],
  endComments: Comment[],
  trailingComment: null | Comment,
): DocumentHead {
  return {
    type: "documentHead",
    position,
    endComments,
    ...createTrailingCommentAttachable(trailingComment),
    children,
  };
}
