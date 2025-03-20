import { createComment } from "../factories/comment.js";
import type Context from "./context.js";
import { type Comment } from "../types.js";
import type * as YAML from "../yaml.js";

export function transformComment(
  comment: YAML.cst.Comment,
  context: Context,
): Comment {
  return createComment(context.transformRange(comment.range!), comment.comment);
}
