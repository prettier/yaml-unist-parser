import { type Content, type Plain, type Position } from "../types.ts";
import { createCommentAttachable } from "./comment-attachable.ts";

export function createPlain(
  position: Position,
  content: Content,
  value: string,
): Plain {
  return {
    type: "plain",
    position,
    ...createCommentAttachable(),
    ...content,
    value,
  };
}
