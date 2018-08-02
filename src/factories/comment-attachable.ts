import { CommentAttachable } from "../types";

export function createCommentAttachable(): CommentAttachable {
  return {
    leadingComments: [],
    trailingComments: [],
  };
}
