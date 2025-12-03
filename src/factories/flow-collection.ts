import {
  type Content,
  type FlowMappingItem,
  type FlowSequenceItem,
  type Position,
} from "../types.ts";
import { createCommentAttachable } from "./comment-attachable.ts";
import { createEndCommentAttachable } from "./end-comment-attachable.ts";
import { createNode } from "./node.ts";

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
