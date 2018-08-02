import {
  FlowMappingItem,
  MappingKey,
  MappingValue,
  Null,
  Position,
} from "../types";
import { createCommentAttachable } from "./comment-attachable";
import { createNode } from "./node";

export function createFlowMappingItem(
  position: Position,
  key: MappingKey | Null,
  value: MappingValue | Null,
): FlowMappingItem {
  return {
    ...createNode("flowMappingItem", position),
    ...createCommentAttachable(),
    children: [key, value],
  };
}
