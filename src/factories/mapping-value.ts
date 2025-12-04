import {
  type ContentNode,
  type MappingValue,
  type Position,
} from "../types.ts";
import { createCommentAttachable } from "./comment-attachable.ts";
import { createEndCommentAttachable } from "./end-comment-attachable.ts";

export function createMappingValue(
  position: Position,
  content: null | ContentNode,
): MappingValue {
  return {
    type: "mappingValue",
    position: position,
    ...createCommentAttachable(),
    ...createEndCommentAttachable(),
    children: !content ? [] : [content],
  };
}
