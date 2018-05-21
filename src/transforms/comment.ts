import assert = require("assert");
import { Context } from "../transform";
import { Comment } from "../types";

export function transformComment(
  comment: yaml.Comment,
  context: Context,
): Comment {
  assert(comment.range !== null);
  return {
    type: "comment",
    position: context.transformRange(comment.range!),
    value: comment.comment,
  };
}
