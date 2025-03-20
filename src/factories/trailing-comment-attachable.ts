import { type Comment, type TrailingCommentAttachable } from "../types.js";

export function createTrailingCommentAttachable(
  trailingComment: null | Comment = null,
): TrailingCommentAttachable {
  return {
    trailingComment,
  };
}
