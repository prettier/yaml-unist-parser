import { Position, VerbatimTag } from "../types";
import { createNode } from "./node";

export function createVerbatimTag(
  position: Position,
  value: string,
): VerbatimTag {
  return {
    ...createNode("verbatimTag", position),
    value,
  };
}
