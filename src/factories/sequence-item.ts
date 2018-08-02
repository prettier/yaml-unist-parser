import { ContentNode, Position, SequenceItem } from "../types";
import { createCommentAttachable } from "./comment-attachable";
import { createEndCommentAttachable } from "./end-comment-attachable";
import { createNode } from "./node";

export function createSequenceItem(
  position: Position,
  content: ContentNode,
): SequenceItem {
  return {
    ...createNode("sequenceItem", position),
    ...createCommentAttachable(),
    ...createEndCommentAttachable(),
    children: [content],
  };
}
