import { type Content, type Position, type QuoteValue } from "../types.js";
import { createCommentAttachable } from "./comment-attachable.js";
import { createNode } from "./node.js";

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
