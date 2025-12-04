import {
  type Comment,
  type Document,
  type Position,
  type Root,
} from "../types.ts";

export function createRoot(
  position: Position,
  children: Document[],
  comments: Comment[],
): Root {
  return {
    type: "root",
    position,
    children,
    comments,
  };
}
