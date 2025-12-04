import {
  type Content,
  type FlowMappingItem,
  type FlowSequenceItem,
  type Position,
} from "../types.ts";

export function createFlowCollection<
  T extends FlowMappingItem | FlowSequenceItem,
>(position: Position, content: Content, children: T[]) {
  return {
    type: "flowCollection",
    position,

    leadingComments: [],
    trailingComment: null,
    endComments: [],
    ...content,
    children,
  };
}
