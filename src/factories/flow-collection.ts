import { Content, FlowMappingItem, FlowSequenceItem, Position } from "../types.js";
import { createCommentAttachable } from "./comment-attachable.js";
import { createEndCommentAttachable } from "./end-comment-attachable.js";
import { createNode } from "./node.js";

export function createFlowCollection<
  T extends FlowMappingItem | FlowSequenceItem,
>(position: Position, content: Content, children: T[]) {
  return {
    ...createNode("flowCollection", position),
    ...createCommentAttachable(),
    ...createEndCommentAttachable(),
    ...content,
    children,
  };
}
