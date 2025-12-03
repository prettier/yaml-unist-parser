import {
  type Content,
  type Mapping,
  type MappingItem,
  type Position,
} from "../types.ts";
import { createLeadingCommentAttachable } from "./leading-comment-attachable.ts";
import { createNode } from "./node.ts";

export function createMapping(
  position: Position,
  content: Content,
  children: MappingItem[],
): Mapping {
  return {
    ...createNode("mapping", position),
    ...createLeadingCommentAttachable(),
    ...content,
    children,
  };
}
