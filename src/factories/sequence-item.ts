import {
  type ContentNode,
  type Position,
  type SequenceItem,
} from "../types.ts";
import { createCommentAttachable } from "./comment-attachable.ts";
import { createEndCommentAttachable } from "./end-comment-attachable.ts";
import { createNode } from "./node.ts";

export function createSequenceItem(
  position: Position,
  content: null | ContentNode,
): SequenceItem {
  return {
    ...createNode("sequenceItem", position),
    ...createCommentAttachable(),
    ...createEndCommentAttachable(),
    children: !content ? [] : [content],
  };
}
