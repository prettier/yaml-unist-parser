import { ContentNode, FlowSequenceItem, Position } from "../types";
import { createNode } from "./node";

export function createFlowSequenceItem(
  position: Position,
  content: ContentNode,
): FlowSequenceItem {
  return {
    ...createNode("flowSequenceItem", position),
    children: [content],
  };
}
