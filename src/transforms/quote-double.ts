import { createQuoteDouble } from "../factories/quote-double.js";
import type Context from "./context.js";
import { type QuoteDouble } from "../types.js";
import type * as YAML from "../yaml.js";
import { transformAstQuoteValue } from "./quote-value.js";

export function transformQuoteDouble(
  quoteDouble: YAML.ast.QuoteDouble,
  context: Context,
): QuoteDouble {
  return createQuoteDouble(transformAstQuoteValue(quoteDouble, context));
}
