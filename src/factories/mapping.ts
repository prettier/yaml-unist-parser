import { Content, Mapping, MappingItem, Position } from "../types.js";
import { createLeadingCommentAttachable } from "./leading-comment-attachable.js";
import { createNode } from "./node.js";

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
