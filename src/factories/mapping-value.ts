import {
  type ContentNode,
  type MappingValue,
  type Position,
} from "../types.ts";

export function createMappingValue(
  position: Position,
  content: null | ContentNode,
): MappingValue {
  return {
    type: "mappingValue",
    position,

    leadingComments: [],
    trailingComment: null,
    endComments: [],
    children: !content ? [] : [content],
  };
}
