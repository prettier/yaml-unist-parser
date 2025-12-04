import {
  type Content,
  type Position,
  type Sequence,
  type SequenceItem,
} from "../types.ts";

export function createSequence(
  position: Position,
  content: Content,
  children: SequenceItem[],
): Sequence {
  return {
    type: "sequence",
    position,
    leadingComments: [],
    endComments: [],
    ...content,
    children,
  };
}
