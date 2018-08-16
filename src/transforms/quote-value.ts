import YAML from "yaml";
import { createQuoteValue } from "../factories/quote-value";
import { Context } from "../transform";
import { QuoteValue } from "../types";

export function transformAstQuoteValue(
  quoteValue: YAML.ast.QuoteDouble | YAML.ast.QuoteSingle,
  context: Context,
): QuoteValue {
  const cstNode = quoteValue.cstNode!;
  return createQuoteValue(
    context.transformRange(cstNode.valueRange!),
    context.transformContent(quoteValue),
    cstNode.strValue as string,
  );
}
