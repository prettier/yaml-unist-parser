import {
  type Comment,
  type ContentNode,
  type DocumentBody,
  type Position,
} from "../types.js";
import { createEndCommentAttachable } from "./end-comment-attachable.js";
import { createNode } from "./node.js";

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
