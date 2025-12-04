import { type Alias, type Content, type Position } from "../types.js";
import { createCommentAttachable } from "./comment-attachable.js";

export function createAlias(
  position: Position,
  content: Content,
  value: string,
): Alias {
  return {
    type: "alias",
    position: position,
    ...createCommentAttachable(),
    ...content,
    value,
  };
}
