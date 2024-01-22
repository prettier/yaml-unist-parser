import { createComment } from "../factories/comment.js";
import { Context } from "../transform.js";
import { Comment, YAMLComment } from "../types.js";

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
