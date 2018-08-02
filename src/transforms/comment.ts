import assert = require("assert");
import { createComment } from "../factories/comment";
import { Context } from "../transform";
import { Comment } from "../types";

export function transformComment(
  comment: yaml.Comment,
  context: Context,
): Comment {
  assert(comment.range !== null);
  return createComment(context.transformRange(comment.range!), comment.comment);
}
