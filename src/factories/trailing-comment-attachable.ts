import { Comment, TrailingCommentAttachable } from "../types.js";

export function createTrailingCommentAttachable(
  trailingComment: null | Comment = null,
): TrailingCommentAttachable {
  return {
    trailingComment,
  };
}
