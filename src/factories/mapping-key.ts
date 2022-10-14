import { ContentNode, MappingKey, Position } from "../types.js";
import { createEndCommentAttachable } from "./end-comment-attachable.js";
import { createNode } from "./node.js";
import { createTrailingCommentAttachable } from "./trailing-comment-attachable.js";

export function createMappingKey(
  position: Position,
  content: null | ContentNode,
): MappingKey {
  return {
    ...createNode("mappingKey", position),
    ...createTrailingCommentAttachable(),
    ...createEndCommentAttachable(),
    children: !content ? [] : [content],
  };
}
