import { ContentNode, MappingValue, Position } from "../types";
import { createCommentAttachable } from "./comment-attachable";
import { createEndCommentAttachable } from "./end-comment-attachable";
import { createNode } from "./node";

export function createMappingValue(
  position: Position,
  content: null | ContentNode,
): MappingValue {
  return {
    ...createNode("mappingValue", position),
    ...createCommentAttachable(),
    ...createEndCommentAttachable(),
    children: !content ? [] : [content],
  };
}
