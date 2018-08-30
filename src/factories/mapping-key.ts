import { ContentNode, MappingKey, Position } from "../types";
import { createEndCommentAttachable } from "./end-comment-attachable";
import { createNode } from "./node";
import { createTrailingCommentAttachable } from "./trailing-comment-attachable";

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
