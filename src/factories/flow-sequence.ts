import {
  type Content,
  type FlowMappingItem,
  type FlowSequence,
  type FlowSequenceItem,
  type Position,
} from "../types.js";
import { createFlowCollection } from "./flow-collection.js";

export function createFlowSequence(
  position: Position,
  content: Content,
  children: Array<FlowMappingItem | FlowSequenceItem>,
): FlowSequence {
  return {
    ...createFlowCollection(position, content, children),
    type: "flowSequence",
  };
}
