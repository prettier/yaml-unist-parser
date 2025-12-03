import { type Content, type Position, type QuoteValue } from "../types.ts";
import { createCommentAttachable } from "./comment-attachable.ts";
import { createNode } from "./node.ts";

export function createQuoteValue(
  position: Position,
  content: Content,
  value: string,
): QuoteValue {
  return {
    ...createNode("quoteValue", position),
    ...content,
    ...createCommentAttachable(),
    value,
  };
}
