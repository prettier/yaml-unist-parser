import { MappingItem, MappingKey, MappingValue, Position } from "../types.js";
import { createLeadingCommentAttachable } from "./leading-comment-attachable.js";
import { createNode } from "./node.js";

export function createMappingItem(
  position: Position,
  key: MappingKey,
  value: MappingValue,
): MappingItem {
  return {
    ...createNode("mappingItem", position),
    ...createLeadingCommentAttachable(),
    children: [key, value],
  };
}
