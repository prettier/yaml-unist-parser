import { CommentAttachable } from "../types";
import { createLeadingCommentAttachable } from "./leading-comment-attachable";
import { createTrailingCommentAttachable } from "./trailing-comment-attachable";

export function createCommentAttachable(): CommentAttachable {
  return {
    ...createLeadingCommentAttachable(),
    ...createTrailingCommentAttachable(),
  };
}
