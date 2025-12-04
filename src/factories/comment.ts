import { type Position } from "../types.ts";

export function createComment(position: Position, value: string) {
  return {
    type: "comment",
    position,
    value,
  };
}
