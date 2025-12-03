import { type CommentAttachable } from "../types.ts";
import { createLeadingCommentAttachable } from "./leading-comment-attachable.ts";
import { createTrailingCommentAttachable } from "./trailing-comment-attachable.ts";

export function createCommentAttachable(): CommentAttachable {
  return {
    ...createLeadingCommentAttachable(),
    ...createTrailingCommentAttachable(),
  };
}
