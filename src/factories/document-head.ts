import {
  type Comment,
  type Directive,
  type DocumentHead,
  type Position,
} from "../types.ts";

export function createDocumentHead(
  position: Position,
  children: Directive[],
  endComments: Comment[],
  trailingComment: null | Comment,
): DocumentHead {
  return {
    type: "documentHead",
    position,
    endComments,
    trailingComment,
    children,
  };
}
