import { type Content, type Plain, type Position } from "../types.ts";

export function createPlain(
  position: Position,
  content: Content,
  value: string,
): Plain {
  return {
    type: "plain",
    position,
    leadingComments: [],
    trailingComment: null,
    ...content,
    value,
  };
}
