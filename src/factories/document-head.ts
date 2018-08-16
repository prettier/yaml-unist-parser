import { Comment, Directive, DocumentHead, Position } from "../types";
import { createEndCommentAttachable } from "./end-comment-attachable";
import { createNode } from "./node";

export function createDocumentHead(
  position: Position,
  children: Directive[],
  endComments: Comment[],
): DocumentHead {
  return {
    ...createNode("documentHead", position),
    ...createEndCommentAttachable(endComments),
    children,
  };
}
