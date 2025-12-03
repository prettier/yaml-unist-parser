import { type Directive, type Position } from "../types.ts";
import { createCommentAttachable } from "./comment-attachable.ts";
import { createNode } from "./node.ts";

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
