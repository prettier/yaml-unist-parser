import {
  type ContentNode,
  type MappingValue,
  type Position,
} from "../types.ts";
import { createCommentAttachable } from "./comment-attachable.ts";

export function createMappingValue(
  position: Position,
  content: null | ContentNode,
): MappingValue {
  return {
    type: "mappingValue",
    position,
    ...createCommentAttachable(),
    endComments: [],
    children: !content ? [] : [content],
  };
}
