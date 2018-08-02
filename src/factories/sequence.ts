import { Position, Sequence, SequenceItem } from "../types";
import { createCommentAttachable } from "./comment-attachable";
import { createContent } from "./content";
import { createEndCommentAttachable } from "./end-comment-attachable";
import { createNode } from "./node";

export function createSequence(
  position: Position,
  children: SequenceItem[],
): Sequence {
  return {
    ...createNode("sequence", position),
    ...createContent(),
    ...createCommentAttachable(),
    ...createEndCommentAttachable(),
    children,
  };
}
