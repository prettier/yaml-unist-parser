import { type Anchor, type Position } from "../types.js";

export function createAnchor(position: Position, value: string): Anchor {
  return {
    type: "anchor",
    position,
    value,
  };
}
