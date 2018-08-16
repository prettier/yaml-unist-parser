import { Comment, ContentNode, DocumentBody, Position } from "../types";
import { createEndCommentAttachable } from "./end-comment-attachable";
import { createNode } from "./node";

export function createDocumentBody(
  position: Position,
  children: [ContentNode],
  endComments: Comment[],
): DocumentBody {
  return {
    ...createNode("documentBody", position),
    ...createEndCommentAttachable(endComments),
    children,
  };
}
