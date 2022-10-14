import { Content, Plain, Position } from "../types.js";
import { createCommentAttachable } from "./comment-attachable.js";
import { createNode } from "./node.js";

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
