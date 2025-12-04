import { type Position, type Tag } from "../types.ts";

export function createTag(position: Position, value: string): Tag {
  return {
    type: "tag",
    position,
    value,
  };
}
