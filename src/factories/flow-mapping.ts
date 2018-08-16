import { Content, FlowMapping, FlowMappingItem, Position } from "../types";
import { createFlowCollection } from "./flow-collection";

export function createFlowMapping(
  position: Position,
  content: Content,
  children: FlowMappingItem[],
): FlowMapping {
  return {
    ...createFlowCollection(position, content, children),
    type: "flowMapping",
  };
}
