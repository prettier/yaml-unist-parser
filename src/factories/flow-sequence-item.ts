import { ContentNode, FlowSequenceItem, Position } from "../types.js";
import { createNode } from "./node.js";

export function createFlowSequenceItem(
  position: Position,
  content: ContentNode,
): FlowSequenceItem {
  return {
    ...createNode("flowSequenceItem", position),
    children: [content],
  };
}
