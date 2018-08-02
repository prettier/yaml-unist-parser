import { NonSpecificTag, Position } from "../types";
import { createNode } from "./node";

export function createNonSpecificTag(position: Position): NonSpecificTag {
  return createNode("nonSpecificTag", position);
}
