import {
  type Content,
  type Mapping,
  type MappingItem,
  type Position,
} from "../types.ts";
import { createLeadingCommentAttachable } from "./leading-comment-attachable.ts";

export function createMapping(
  position: Position,
  content: Content,
  children: MappingItem[],
): Mapping {
  return {
    type: "mapping",
    position,
    ...createLeadingCommentAttachable(),
    ...content,
    children,
  };
}
