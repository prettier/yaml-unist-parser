import { type Position, type Tag } from "../types.ts";
import { createNode } from "./node.ts";

export function createTag(position: Position, value: string): Tag {
  return {
    ...createNode("tag", position),
    value,
  };
}
