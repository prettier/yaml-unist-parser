import type * as YAML_CST from "../cst.ts";
import type { Comment } from "../types.ts";
import type Context from "./context.ts";

export function transformComment(
  comment: YAML_CST.CommentSourceToken,
  context: Context,
): Comment {
  return {
    type: "comment",
    position: context.transformRange([
      comment.offset,
      comment.offset + comment.source.length,
    ]),
    value: comment.source.slice(1),
  };
}
