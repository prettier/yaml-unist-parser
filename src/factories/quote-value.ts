import { Content, Position, QuoteValue } from "../types";
import { createCommentAttachable } from "./comment-attachable";
import { createNode } from "./node";

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
