import { Comment, ContentNode, DocumentBody, Position } from "../types";
import { createEndCommentAttachable } from "./end-comment-attachable";
import { createNode } from "./node";

export function createDocumentBody(
  position: Position,
  content: null | ContentNode,
  endComments: Comment[],
): DocumentBody {
  return {
    ...createNode("documentBody", position),
    ...createEndCommentAttachable(endComments),
    children: !content ? [] : [content],
  };
}
