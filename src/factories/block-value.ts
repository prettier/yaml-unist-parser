import { BlockValue, Comment, Content, Position } from "../types";
import { createLeadingCommentAttachable } from "./leading-comment-attachable";
import { createNode } from "./node";

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
