import {
  FlowMappingItem,
  FlowSequence,
  FlowSequenceItem,
  Position,
} from "../types";
import { createFlowCollection } from "./flow-collection";

export function createFlowSequence(
  position: Position,
  children: Array<FlowMappingItem | FlowSequenceItem>,
): FlowSequence {
  return {
    ...createFlowCollection(position, children),
    type: "flowSequence",
  };
}
