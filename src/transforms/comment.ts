import { createComment } from "../factories/comment.js";
import { type Comment, type YAMLComment } from "../types.js";
import type Context from "./context.js";

export function transformComment(
  comment: YAMLComment,
  context: Context,
): Comment {
  return createComment(
    context.transformRange({
      origStart: comment.range![0],
      origEnd: comment.range![1],
    }),
    comment.value,
  );
}
