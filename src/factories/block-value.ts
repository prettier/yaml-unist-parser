import { BlockValue, Comment, Content, Position } from "../types.js";
import { createLeadingCommentAttachable } from "./leading-comment-attachable.js";
import { createNode } from "./node.js";

export function createBlockValue(
  position: Position,
  content: Content,
  chomping: "clip" | "keep" | "strip",
  indent: null | number,
  value: string,
  indicatorComment: null | Comment,
): BlockValue {
  return {
    ...createNode("blockValue", position),
    ...createLeadingCommentAttachable(),
    ...content,
    chomping,
    indent,
    value,
    indicatorComment,
  };
}
