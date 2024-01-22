import { createBlockLiteral } from "../factories/block-literal.js";
import { Context } from "../transform.js";
import { BlockLiteral, YAMLBlockLiteral } from "../types.js";
import { transformAstBlockValue } from "./block-value.js";

export function transformBlockLiteral(
  blockLiteral: YAMLBlockLiteral,
  context: Context,
): BlockLiteral {
  return createBlockLiteral(transformAstBlockValue(blockLiteral, context));
}
