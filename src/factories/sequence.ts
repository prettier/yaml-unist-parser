import {
  type Content,
  type Position,
  type Sequence,
  type SequenceItem,
} from "../types.js";
import { createEndCommentAttachable } from "./end-comment-attachable.js";
import { createLeadingCommentAttachable } from "./leading-comment-attachable.js";
import { createNode } from "./node.js";

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
