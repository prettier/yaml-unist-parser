import {
  type ContentNode,
  type Position,
  type SequenceItem,
} from "../types.ts";
import { createCommentAttachable } from "./comment-attachable.ts";

export function createSequenceItem(
  position: Position,
  content: null | ContentNode,
): SequenceItem {
  return {
    type: "sequenceItem",
    position,
    ...createCommentAttachable(),
    endComments: [],
    children: !content ? [] : [content],
  };
}
