import type * as YAML_CST from "../cst.ts";
import { createComment } from "../factories/comment.ts";
import type { Comment } from "../types.ts";
import type Context from "./context.ts";

export function transformComment(
  comment: YAML_CST.CommentSourceToken,
  context: Context,
): Comment {
  return createComment(
    context.transformRange({
      origStart: comment.offset,
      origEnd: comment.offset + comment.source.length,
    }),
    comment.source.slice(1),
  );
}
