import {
  type Comment,
  type Directive,
  type DocumentHead,
  type Position,
} from "../types.ts";
import { createEndCommentAttachable } from "./end-comment-attachable.ts";
import { createNode } from "./node.ts";
import { createTrailingCommentAttachable } from "./trailing-comment-attachable.ts";

export function createDocumentHead(
  position: Position,
  children: Directive[],
  endComments: Comment[],
  trailingComment: null | Comment,
): DocumentHead {
  return {
    ...createNode("documentHead", position),
    ...createEndCommentAttachable(endComments),
    ...createTrailingCommentAttachable(trailingComment),
    children,
  };
}
