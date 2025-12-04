import {
  type FlowMappingItem,
  type MappingKey,
  type MappingValue,
  type Position,
} from "../types.ts";

export function createFlowMappingItem(
  position: Position,
  key: MappingKey,
  value: MappingValue,
): FlowMappingItem {
  return {
    type: "flowMappingItem",
    position,
    leadingComments: [],
    children: [key, value],
  };
}
