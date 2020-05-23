import { createComment } from "../factories/comment";
import { Context } from "../transform";
import { Comment } from "../types";
import * as YAML from "../yaml";

export function transformComment(
  comment: YAML.cst.Comment,
  context: Context,
): Comment {
  return createComment(context.transformRange(comment.range!), comment.comment);
}
