import { type ContentNode, type MappingKey, type Position } from "../types.ts";

export function createMappingKey(
  position: Position,
  content: null | ContentNode,
): MappingKey {
  return {
    type: "mappingKey",
    position,
    trailingComment: null,
    endComments: [],
    children: !content ? [] : [content],
  };
}
