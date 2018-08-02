import {
  MappingItem,
  MappingKey,
  MappingValue,
  Null,
  Position,
} from "../types";
import { createCommentAttachable } from "./comment-attachable";
import { createNode } from "./node";

export function createMappingItem(
  position: Position,
  key: MappingKey,
  value: MappingValue | Null,
): MappingItem {
  return {
    ...createNode("mappingItem", position),
    ...createCommentAttachable(),
    children: [key, value],
  };
}
