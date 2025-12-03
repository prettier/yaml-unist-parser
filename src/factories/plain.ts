import { type Content, type Plain, type Position } from "../types.ts";
import { createCommentAttachable } from "./comment-attachable.ts";
import { createNode } from "./node.ts";

export function createPlain(
  position: Position,
  content: Content,
  value: string,
): Plain {
  return {
    ...createNode("plain", position),
    ...createCommentAttachable(),
    ...content,
    value,
  };
}
