import { Comment, TrailingCommentAttachable } from "../types";

export function createTrailingCommentAttachable(
  trailingComment: null | Comment = null,
): TrailingCommentAttachable {
  return {
    trailingComment,
  };
}
