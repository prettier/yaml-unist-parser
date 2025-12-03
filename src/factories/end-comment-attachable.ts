import { type Comment, type EndCommentAttachable } from "../types.ts";

export function createEndCommentAttachable(
  endComments: Comment[] = [],
): EndCommentAttachable {
  return {
    endComments,
  };
}
