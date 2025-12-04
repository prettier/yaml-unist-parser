import { type Directive, type Position } from "../types.ts";

export function createDirective(
  position: Position,
  name: string,
  parameters: string[],
): Directive {
  return {
    type: "directive",
    position,
    leadingComments: [],
    trailingComment: null,
    name,
    parameters,
  };
}
