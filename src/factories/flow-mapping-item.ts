import {
  type FlowMappingItem,
  type MappingKey,
  type MappingValue,
  type Position,
} from "../types.ts";
import { createLeadingCommentAttachable } from "./leading-comment-attachable.ts";
import { createNode } from "./node.ts";

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
