import { Alias, Content, Position } from "../types";
import { createCommentAttachable } from "./comment-attachable";
import { createNode } from "./node";

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
