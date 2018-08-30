import { Comment, EndCommentAttachable } from "../types";

export function createEndCommentAttachable(
  endComments: Comment[] = [],
): EndCommentAttachable {
  return {
    endComments,
  };
}
