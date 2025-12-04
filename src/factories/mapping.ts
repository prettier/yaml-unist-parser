import {
  type Content,
  type Mapping,
  type MappingItem,
  type Position,
} from "../types.ts";

export function createMapping(
  position: Position,
  content: Content,
  children: MappingItem[],
): Mapping {
  return {
    type: "mapping",
    position,
    leadingComments: [],
    ...content,
    children,
  };
}
