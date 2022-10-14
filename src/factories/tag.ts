import { Position, Tag } from "../types.js";
import { createNode } from "./node.js";

export function createTag(position: Position, value: string): Tag {
  return {
    ...createNode("tag", position),
    value,
  };
}
