import { Comment, Directive, DocumentHead, Position } from "../types";
import { createNode } from "./node";

export function createDocumentHead(
  position: Position,
  children: Array<Comment | Directive>,
): DocumentHead {
  return {
    ...createNode("documentHead", position),
    children,
  };
}
