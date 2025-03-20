import { type Directive, type Position } from "../types.js";
import { createCommentAttachable } from "./comment-attachable.js";
import { createNode } from "./node.js";

export function createDirective(
  position: Position,
  name: string,
  parameters: string[],
): Directive {
  return {
    ...createNode("directive", position),
    ...createCommentAttachable(),
    name,
    parameters,
  };
}
