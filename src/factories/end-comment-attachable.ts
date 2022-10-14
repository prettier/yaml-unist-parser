import { Comment, EndCommentAttachable } from "../types.js";

export function createEndCommentAttachable(
  endComments: Comment[] = [],
): EndCommentAttachable {
  return {
    endComments,
  };
}
