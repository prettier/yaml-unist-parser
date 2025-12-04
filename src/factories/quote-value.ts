import { type Content, type Position, type QuoteValue } from "../types.ts";

export function createQuoteValue(
  position: Position,
  content: Content,
  value: string,
): QuoteValue {
  return {
    type: "quoteValue",
    position,
    ...content,

    leadingComments: [],
    trailingComment: null,
    value,
  };
}
