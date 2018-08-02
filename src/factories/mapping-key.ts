import { ContentNode, MappingKey, Position } from "../types";
import { createCommentAttachable } from "./comment-attachable";
import { createEndCommentAttachable } from "./end-comment-attachable";
import { createNode } from "./node";

export function createMappingKey(
  position: Position,
  content: ContentNode,
): MappingKey {
  return {
    ...createNode("mappingKey", position),
    ...createCommentAttachable(),
    ...createEndCommentAttachable(),
    children: [content],
  };
}
