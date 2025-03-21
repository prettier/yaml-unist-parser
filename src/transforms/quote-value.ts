import type * as YAML from "yaml";
import { createQuoteValue } from "../factories/quote-value.js";
import { type QuoteValue } from "../types.js";
import type Context from "./context.js";

export function transformAstQuoteValue(
  quoteValue: YAML.AST.QuoteDouble | YAML.AST.QuoteSingle,
  context: Context,
): QuoteValue {
  const cstNode = quoteValue.cstNode!;
  return createQuoteValue(
    context.transformRange(cstNode.valueRange!),
    context.transformContent(quoteValue),
    cstNode.strValue as string,
  );
}
