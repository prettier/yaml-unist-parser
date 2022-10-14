import { createComment } from "../factories/comment.js";
import { Context } from "../transform.js";
import { Comment } from "../types.js";
import * as YAML from "../yaml.js";

export function transformComment(
  comment: YAML.cst.Comment,
  context: Context,
): Comment {
  return createComment(context.transformRange(comment.range!), comment.comment);
}
