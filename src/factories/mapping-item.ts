import { MappingItem, MappingKey, MappingValue, Position } from "../types";
import { createCommentAttachable } from "./comment-attachable";
import { createNode } from "./node";

export function createMappingItem(
  position: Position,
  key: MappingKey,
  value: MappingValue | null,
): MappingItem {
  return {
    ...createNode("mappingItem", position),
    ...createCommentAttachable(),
    children: [key, value],
  };
}
