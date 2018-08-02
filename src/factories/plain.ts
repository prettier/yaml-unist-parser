import { Plain, Position } from "../types";
import { createCommentAttachable } from "./comment-attachable";
import { createContent } from "./content";
import { createNode } from "./node";

export function createPlain(position: Position, value: string): Plain {
  return {
    ...createNode("plain", position),
    ...createContent(),
    ...createCommentAttachable(),
    value,
  };
}
