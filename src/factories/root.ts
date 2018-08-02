import { Comment, Document, Position, Root } from "../types";
import { createNode } from "./node";

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
