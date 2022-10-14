import { createQuoteDouble } from "../factories/quote-double.js";
import { Context } from "../transform.js";
import { QuoteDouble } from "../types.js";
import * as YAML from "../yaml.js";
import { transformAstQuoteValue } from "./quote-value.js";

export function transformQuoteDouble(
  quoteDouble: YAML.ast.QuoteDouble,
  context: Context,
): QuoteDouble {
  return createQuoteDouble(transformAstQuoteValue(quoteDouble, context));
}
