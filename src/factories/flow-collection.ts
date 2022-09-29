import { Content, FlowMappingItem, FlowSequenceItem, Position } from "../types";
import { createCommentAttachable } from "./comment-attachable";
import { createEndCommentAttachable } from "./end-comment-attachable";
import { createNode } from "./node";

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
