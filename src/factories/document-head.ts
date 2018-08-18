import { Comment, Directive, DocumentHead, Position } from "../types";
import { createEndCommentAttachable } from "./end-comment-attachable";
import { createNode } from "./node";
import { createTrailingCommentAttachable } from "./trailing-comment-attachable";

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
