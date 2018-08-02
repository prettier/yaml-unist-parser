import { Anchor, Position } from "../types";
import { createNode } from "./node";

export function createAnchor(position: Position, value: string): Anchor {
  return {
    ...createNode("anchor", position),
    value,
  };
}
