import { Position, QuoteValue } from "../types";
import { createCommentAttachable } from "./comment-attachable";
import { createContent } from "./content";
import { createNode } from "./node";

export function createQuoteValue(
  position: Position,
  value: string,
): QuoteValue {
  return {
    ...createNode("quoteValue", position),
    ...createContent(),
    ...createCommentAttachable(),
    value,
  };
}
