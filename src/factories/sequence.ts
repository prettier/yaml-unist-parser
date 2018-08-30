import { Content, Position, Sequence, SequenceItem } from "../types";
import { createEndCommentAttachable } from "./end-comment-attachable";
import { createLeadingCommentAttachable } from "./leading-comment-attachable";
import { createNode } from "./node";

export function createSequence(
  position: Position,
  content: Content,
  children: SequenceItem[],
): Sequence {
  return {
    ...createNode("sequence", position),
    ...createLeadingCommentAttachable(),
    ...createEndCommentAttachable(),
    ...content,
    children,
  };
}
