import { Content, Mapping, MappingItem, Position } from "../types";
import { createLeadingCommentAttachable } from "./leading-comment-attachable";
import { createNode } from "./node";

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
