import { type Alias, type Content, type Position } from "../types.js";

export function createAlias(
  position: Position,
  content: Content,
  value: string,
): Alias {
  return {
    type: "alias",
    position,
    leadingComments: [],
    trailingComment: null,
    ...content,
    value,
  };
}
