import { ContentNode, MappingValue, Position } from "../types.js";
import { createCommentAttachable } from "./comment-attachable.js";
import { createEndCommentAttachable } from "./end-comment-attachable.js";
import { createNode } from "./node.js";

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
