import {
  type MappingItem,
  type MappingKey,
  type MappingValue,
  type Position,
} from "../types.ts";
import { createLeadingCommentAttachable } from "./leading-comment-attachable.ts";

export function createMappingItem(
  position: Position,
  key: MappingKey,
  value: MappingValue,
): MappingItem {
  return {
    type: "mappingItem",
    position: position,
    ...createLeadingCommentAttachable(),
    children: [key, value],
  };
}
