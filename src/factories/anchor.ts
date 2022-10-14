import { Anchor, Position } from "../types.js";
import { createNode } from "./node.js";

export function createAnchor(position: Position, value: string): Anchor {
  return {
    ...createNode("anchor", position),
    value,
  };
}
