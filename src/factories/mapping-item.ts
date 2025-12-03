import {
  type MappingItem,
  type MappingKey,
  type MappingValue,
  type Position,
} from "../types.ts";
import { createLeadingCommentAttachable } from "./leading-comment-attachable.ts";
import { createNode } from "./node.ts";

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
