import {
  type ContentNode,
  type MappingValue,
  type Position,
} from "../types.ts";
import { createCommentAttachable } from "./comment-attachable.ts";
import { createEndCommentAttachable } from "./end-comment-attachable.ts";
import { createNode } from "./node.ts";

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
