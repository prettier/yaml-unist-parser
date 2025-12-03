import type * as YAML_CST from "../cst.js";
import { createComment } from "../factories/comment.js";
import type { Comment } from "../types.js";
import type Context from "./context.js";

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
