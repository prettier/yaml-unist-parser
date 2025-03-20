import { type Comment, type EndCommentAttachable } from "../types.js";

export function createEndCommentAttachable(
  endComments: Comment[] = [],
): EndCommentAttachable {
  return {
    endComments,
  };
}
