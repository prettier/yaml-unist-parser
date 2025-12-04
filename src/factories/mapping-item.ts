import {
  type MappingItem,
  type MappingKey,
  type MappingValue,
  type Position,
} from "../types.ts";

export function createMappingItem(
  position: Position,
  key: MappingKey,
  value: MappingValue,
): MappingItem {
  return {
    type: "mappingItem",
    position,
    leadingComments: [],
    children: [key, value],
  };
}
