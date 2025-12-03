import type * as YAML from "yaml";
import type * as YAML_CST from "../cst.ts";
import { createQuoteDouble } from "../factories/quote-double.ts";
import { type QuoteDouble } from "../types.ts";
import type Context from "./context.ts";
import { transformAstQuoteValue } from "./quote-value.ts";
import type { TransformNodeProperties } from "./transform.ts";

export function transformQuoteDouble(
  quoteDouble: YAML.Scalar.Parsed,
  context: Context,
  props: TransformNodeProperties,
): QuoteDouble {
  const srcToken: YAML_CST.FlowScalar | YAML.CST.BlockScalar | undefined =
    quoteDouble.srcToken;

  // istanbul ignore if -- @preserve
  if (!srcToken || srcToken.type !== "double-quoted-scalar") {
    throw new Error("Expected double-quoted scalar srcToken");
  }
  return createQuoteDouble(
    transformAstQuoteValue(quoteDouble, srcToken, context, props),
  );
}
