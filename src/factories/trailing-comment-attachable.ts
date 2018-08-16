import { Comment, TrailingCommentAttachable } from "../types";

export function createTrailingCommentAttachable(
  trailingComments: Comment[] = [],
): TrailingCommentAttachable {
  return {
    trailingComments,
  };
}
