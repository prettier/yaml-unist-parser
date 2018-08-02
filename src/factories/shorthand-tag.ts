import { Position, ShorthandTag } from "../types";
import { createNode } from "./node";

export function createShorthandTag(
  position: Position,
  handle: string,
  suffix: string,
): ShorthandTag {
  return {
    ...createNode("shorthandTag", position),
    handle,
    suffix,
  };
}
