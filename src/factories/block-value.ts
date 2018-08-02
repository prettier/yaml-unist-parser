import { BlockValue, Position } from "../types";
import { createCommentAttachable } from "./comment-attachable";
import { createContent } from "./content";
import { createNode } from "./node";

export function createBlockValue(
  position: Position,
  chomping: "clip" | "keep" | "strip",
  indent: null | number,
  value: string,
): BlockValue {
  return {
    ...createNode("blockValue", position),
    ...createContent(),
    ...createCommentAttachable(),
    chomping,
    indent,
    value,
  };
}
