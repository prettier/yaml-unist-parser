import { Mapping, MappingItem, Position } from "../types";
import { createCommentAttachable } from "./comment-attachable";
import { createContent } from "./content";
import { createNode } from "./node";

export function createMapping(
  position: Position,
  children: MappingItem[],
): Mapping {
  return {
    ...createNode("mapping", position),
    ...createContent(),
    ...createCommentAttachable(),
    children,
  };
}
