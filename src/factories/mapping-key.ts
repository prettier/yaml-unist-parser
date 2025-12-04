import { type ContentNode, type MappingKey, type Position } from "../types.ts";
import { createEndCommentAttachable } from "./end-comment-attachable.ts";
import { createTrailingCommentAttachable } from "./trailing-comment-attachable.ts";

export function createMappingKey(
  position: Position,
  content: null | ContentNode,
): MappingKey {
  return {
    type: "mappingKey",
    position,
    ...createTrailingCommentAttachable(),
    ...createEndCommentAttachable(),
    children: !content ? [] : [content],
  };
}
