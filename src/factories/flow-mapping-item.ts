import { FlowMappingItem, MappingKey, MappingValue, Position } from "../types";
import { createCommentAttachable } from "./comment-attachable";
import { createNode } from "./node";

export function createFlowMappingItem(
  position: Position,
  key: MappingKey | null,
  value: MappingValue | null,
): FlowMappingItem {
  return {
    ...createNode("flowMappingItem", position),
    ...createCommentAttachable(),
    children: [key, value],
  };
}
