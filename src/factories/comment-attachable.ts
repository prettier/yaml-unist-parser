import { type CommentAttachable } from "../types.js";
import { createLeadingCommentAttachable } from "./leading-comment-attachable.js";
import { createTrailingCommentAttachable } from "./trailing-comment-attachable.js";

export function createCommentAttachable(): CommentAttachable {
  return {
    ...createLeadingCommentAttachable(),
    ...createTrailingCommentAttachable(),
  };
}
