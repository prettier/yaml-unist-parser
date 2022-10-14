import { Position } from "../types.js";
import { createNode } from "./node.js";

export function createComment(position: Position, value: string) {
  return {
    ...createNode("comment", position),
    value,
  };
}
