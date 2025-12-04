import {
  type ContentNode,
  type Position,
  type SequenceItem,
} from "../types.ts";

export function createSequenceItem(
  position: Position,
  content: null | ContentNode,
): SequenceItem {
  return {
    type: "sequenceItem",
    position,
    leadingComments: [],
    trailingComment: null,
    endComments: [],
    children: !content ? [] : [content],
  };
}
