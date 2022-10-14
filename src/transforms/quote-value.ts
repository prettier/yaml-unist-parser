import { createQuoteValue } from "../factories/quote-value.js";
import { Context } from "../transform.js";
import { QuoteValue } from "../types.js";
import * as YAML from "../yaml.js";

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
