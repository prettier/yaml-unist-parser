import { Comment, ContentNode, DocumentBody, Position } from "../types";
import { createNode } from "./node";

export function createDocumentBody(
  position: Position,
  children: Array<Comment | ContentNode>,
): DocumentBody {
  return {
    ...createNode("documentBody", position),
    children,
  };
}
