import { type CommentAttachable } from "../types.ts";

export function createCommentAttachable(): CommentAttachable {
  return {
    leadingComments: [],
    trailingComment: null,
  };
}
