import { Alias, Position } from "../types";
import { createCommentAttachable } from "./comment-attachable";
import { createContent } from "./content";
import { createNode } from "./node";

export function createAlias(position: Position, value: string): Alias {
  return {
    ...createNode("alias", position),
    ...createContent(),
    ...createCommentAttachable(),
    value,
  };
}
