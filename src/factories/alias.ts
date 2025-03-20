import { type Alias, type Content, type Position } from "../types.js";
import { createCommentAttachable } from "./comment-attachable.js";
import { createNode } from "./node.js";

export function createAlias(
  position: Position,
  content: Content,
  value: string,
): Alias {
  return {
    ...createNode("alias", position),
    ...createCommentAttachable(),
    ...content,
    value,
  };
}
