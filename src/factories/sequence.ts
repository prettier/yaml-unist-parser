import {
  type Content,
  type Position,
  type Sequence,
  type SequenceItem,
} from "../types.ts";
import { createEndCommentAttachable } from "./end-comment-attachable.ts";
import { createLeadingCommentAttachable } from "./leading-comment-attachable.ts";

export function createSequence(
  position: Position,
  content: Content,
  children: SequenceItem[],
): Sequence {
  return {
    type: "sequence",
    position,
    ...createLeadingCommentAttachable(),
    ...createEndCommentAttachable(),
    ...content,
    children,
  };
}
