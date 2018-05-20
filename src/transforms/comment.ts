import assert = require("assert");
import { Context } from "../transform";
import { Comment } from "../types";
import { transformRange } from "./range";

export function transformComment(
  comment: yaml.Comment,
  context: Context,
): Comment {
  assert(comment.range !== null);
  return {
    type: "comment",
    position: transformRange(comment.range!, context),
    value: comment.comment,
  };
}
