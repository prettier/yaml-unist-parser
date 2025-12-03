import {
  type BlockValue,
  type Comment,
  type Content,
  type Position,
} from "../types.ts";
import { createLeadingCommentAttachable } from "./leading-comment-attachable.ts";
import { createNode } from "./node.ts";

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
