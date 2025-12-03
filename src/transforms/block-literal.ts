import type * as YAML from "yaml";
import type * as YAML_CST from "../cst.js";
import { createBlockLiteral } from "../factories/block-literal.js";
import type { BlockLiteral } from "../types.js";
import { transformAstBlockValue } from "./block-value.js";
import type Context from "./context.js";
import type { TransformNodeProperties } from "./transform.js";

export function transformBlockLiteral(
  blockLiteral: YAML.Scalar.Parsed,
  context: Context,
  props: TransformNodeProperties,
): BlockLiteral {
  const srcToken: YAML_CST.FlowScalar | YAML.CST.BlockScalar | undefined =
    blockLiteral.srcToken;

  // istanbul ignore next
  if (!srcToken || srcToken.type !== "block-scalar") {
    throw new Error("Expected block scalar srcToken");
  }
  return createBlockLiteral(
    transformAstBlockValue(blockLiteral, srcToken, context, props),
  );
}
