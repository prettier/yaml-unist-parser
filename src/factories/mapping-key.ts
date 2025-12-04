import { type ContentNode, type MappingKey, type Position } from "../types.ts";
import { createTrailingCommentAttachable } from "./trailing-comment-attachable.ts";

export function createMappingKey(
  position: Position,
  content: null | ContentNode,
): MappingKey {
  return {
    type: "mappingKey",
    position,
    ...createTrailingCommentAttachable(),
    endComments: [],
    children: !content ? [] : [content],
  };
}
