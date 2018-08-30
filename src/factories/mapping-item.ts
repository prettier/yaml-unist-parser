import { MappingItem, MappingKey, MappingValue, Position } from "../types";
import { createLeadingCommentAttachable } from "./leading-comment-attachable";
import { createNode } from "./node";

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
