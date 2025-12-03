import { type Comment, type TrailingCommentAttachable } from "../types.ts";

export function createTrailingCommentAttachable(
  trailingComment: null | Comment = null,
): TrailingCommentAttachable {
  return {
    trailingComment,
  };
}
