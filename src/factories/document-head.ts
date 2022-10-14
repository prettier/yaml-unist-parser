import { Comment, Directive, DocumentHead, Position } from "../types.js";
import { createEndCommentAttachable } from "./end-comment-attachable.js";
import { createNode } from "./node.js";
import { createTrailingCommentAttachable } from "./trailing-comment-attachable.js";

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
