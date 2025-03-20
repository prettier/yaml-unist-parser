import {
  type ContentNode,
  type Position,
  type SequenceItem,
} from "../types.js";
import { createCommentAttachable } from "./comment-attachable.js";
import { createEndCommentAttachable } from "./end-comment-attachable.js";
import { createNode } from "./node.js";

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
