import {
  type BlockValue,
  type Comment,
  type Content,
  type Position,
} from "../types.ts";
import { createLeadingCommentAttachable } from "./leading-comment-attachable.ts";

export function createBlockValue(
  position: Position,
  content: Content,
  chomping: "clip" | "keep" | "strip",
  indent: null | number,
  value: string,
  indicatorComment: null | Comment,
): BlockValue {
  return {
    type: "blockValue",
    position,
    leadingComments: [],
    ...content,
    chomping,
    indent,
    value,
    indicatorComment,
  };
}
