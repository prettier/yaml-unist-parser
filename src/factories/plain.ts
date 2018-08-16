import { Content, Plain, Position } from "../types";
import { createCommentAttachable } from "./comment-attachable";
import { createNode } from "./node";

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
