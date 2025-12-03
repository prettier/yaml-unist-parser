import {
  type ContentNode,
  type FlowSequenceItem,
  type Position,
} from "../types.ts";
import { createNode } from "./node.ts";

export function createFlowSequenceItem(
  position: Position,
  content: ContentNode,
): FlowSequenceItem {
  return {
    ...createNode("flowSequenceItem", position),
    children: [content],
  };
}
