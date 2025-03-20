import { createBlockLiteral } from "../factories/block-literal.js";
import { type BlockLiteral, type YAMLBlockLiteral } from "../types.js";
import type Context from "./context.js";
import { transformAstBlockValue } from "./block-value.js";

export function transformBlockLiteral(
  blockLiteral: YAMLBlockLiteral,
  context: Context,
): BlockLiteral {
  return createBlockLiteral(transformAstBlockValue(blockLiteral, context));
}
