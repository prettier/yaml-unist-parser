import { type Content, type Position, type QuoteValue } from "../types.ts";
import { createCommentAttachable } from "./comment-attachable.ts";

export function createQuoteValue(
  position: Position,
  content: Content,
  value: string,
): QuoteValue {
  return {
    type: "quoteValue",
    position,
    ...content,
    ...createCommentAttachable(),
    value,
  };
}
