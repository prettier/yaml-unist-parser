import {
  type Content,
  type FlowMappingItem,
  type FlowSequence,
  type FlowSequenceItem,
  type Position,
} from "../types.ts";
import { createFlowCollection } from "./flow-collection.ts";

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
