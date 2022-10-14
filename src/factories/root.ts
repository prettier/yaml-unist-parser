import { Comment, Document, Position, Root } from "../types.js";
import { createNode } from "./node.js";

export function createRoot(
  position: Position,
  children: Document[],
  comments: Comment[],
): Root {
  return {
    ...createNode("root", position),
    children,
    comments,
  };
}
