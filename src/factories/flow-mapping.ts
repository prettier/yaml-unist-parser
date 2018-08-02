import { FlowMapping, FlowMappingItem, Position } from "../types";
import { createFlowCollection } from "./flow-collection";

export function createFlowMapping(
  position: Position,
  children: FlowMappingItem[],
): FlowMapping {
  return {
    ...createFlowCollection(position, children),
    type: "flowMapping",
  };
}
