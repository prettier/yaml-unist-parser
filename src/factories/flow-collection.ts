import { FlowMappingItem, FlowSequenceItem, Position } from "../types";
import { createCommentAttachable } from "./comment-attachable";
import { createContent } from "./content";
import { createNode } from "./node";

export function createFlowCollection<
  T extends FlowMappingItem | FlowSequenceItem
>(position: Position, children: T[]) {
  return {
    ...createNode("flowCollection", position),
    ...createContent(),
    ...createCommentAttachable(),
    children,
  };
}
