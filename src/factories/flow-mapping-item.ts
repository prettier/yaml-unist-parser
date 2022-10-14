import { FlowMappingItem, MappingKey, MappingValue, Position } from "../types.js";
import { createLeadingCommentAttachable } from "./leading-comment-attachable.js";
import { createNode } from "./node.js";

export function createFlowMappingItem(
  position: Position,
  key: MappingKey,
  value: MappingValue,
): FlowMappingItem {
  return {
    ...createNode("flowMappingItem", position),
    ...createLeadingCommentAttachable(),
    children: [key, value],
  };
}
