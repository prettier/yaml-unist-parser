import {
  type Content,
  type FlowMapping,
  type FlowMappingItem,
  type Position,
} from "../types.js";
import { createFlowCollection } from "./flow-collection.js";

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
