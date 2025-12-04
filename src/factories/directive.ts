import { type Directive, type Position } from "../types.ts";
import { createCommentAttachable } from "./comment-attachable.ts";

export function createDirective(
  position: Position,
  name: string,
  parameters: string[],
): Directive {
  return {
    type: "directive",
    position,
    ...createCommentAttachable(),
    name,
    parameters,
  };
}
