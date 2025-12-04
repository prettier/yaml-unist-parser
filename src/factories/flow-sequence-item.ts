import {
  type ContentNode,
  type FlowSequenceItem,
  type Position,
} from "../types.ts";

export function createFlowSequenceItem(
  position: Position,
  content: ContentNode,
): FlowSequenceItem {
  return {
    type: "flowSequenceItem",
    position,
    children: [content],
  };
}
