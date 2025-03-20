import { createBlockLiteral } from "../factories/block-literal.js";
import type Context from "./context.js";
import { type BlockLiteral } from "../types.js";
import type * as YAML from "../yaml.js";
import { transformAstBlockValue } from "./block-value.js";

export function transformBlockLiteral(
  blockLiteral: YAML.ast.BlockLiteral,
  context: Context,
): BlockLiteral {
  return createBlockLiteral(transformAstBlockValue(blockLiteral, context));
}
