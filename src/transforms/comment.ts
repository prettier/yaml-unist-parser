import assert = require("assert");
import YAML from "yaml";
import { createComment } from "../factories/comment";
import { Context } from "../transform";
import { Comment } from "../types";

export function transformComment(
  comment: YAML.cst.Comment,
  context: Context,
): Comment {
  assert(comment.range !== null);
  return createComment(context.transformRange(comment.range!), comment.comment);
}
