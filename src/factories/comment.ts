import { Position } from "../types";
import { createNode } from "./node";

export function createComment(position: Position, value: string) {
  return {
    ...createNode("comment", position),
    value,
  };
}
