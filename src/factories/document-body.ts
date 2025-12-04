import {
  type Comment,
  type ContentNode,
  type DocumentBody,
  type Position,
} from "../types.ts";

export function createDocumentBody(
  position: Position,
  content: null | ContentNode,
  endComments: Comment[],
): DocumentBody {
  return {
    type: "documentBody",
    position,
    endComments,
    children: !content ? [] : [content],
  };
}
