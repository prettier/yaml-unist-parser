import { FlowMappingItem, MappingKey, MappingValue, Position } from "../types";
import { createLeadingCommentAttachable } from "./leading-comment-attachable";
import { createNode } from "./node";

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
