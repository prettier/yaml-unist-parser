import { Directive, Position } from "../types";
import { createCommentAttachable } from "./comment-attachable";
import { createNode } from "./node";

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
