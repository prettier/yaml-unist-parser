import {
  type Comment,
  type Document,
  type Position,
  type Root,
} from "../types.ts";
import { createNode } from "./node.ts";

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
