import {
  type Comment,
  type ContentNode,
  type DocumentBody,
  type Position,
} from "../types.ts";
import { createEndCommentAttachable } from "./end-comment-attachable.ts";

export function createDocumentBody(
  position: Position,
  content: null | ContentNode,
  endComments: Comment[],
): DocumentBody {
  return {
    type: "documentBody",
    position,
    ...createEndCommentAttachable(endComments),
    children: !content ? [] : [content],
  };
}
