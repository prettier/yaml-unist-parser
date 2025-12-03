import { type Position } from "../types.ts";
import { createNode } from "./node.ts";

export function createComment(position: Position, value: string) {
  return {
    ...createNode("comment", position),
    value,
  };
}
