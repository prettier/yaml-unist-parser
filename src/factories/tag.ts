import { Position, Tag } from "../types";
import { createNode } from "./node";

export function createTag(position: Position, value: string): Tag {
  return {
    ...createNode("tag", position),
    value,
  };
}
