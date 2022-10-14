import { createBlockLiteral } from "../factories/block-literal.js";
import { Context } from "../transform.js";
import { BlockLiteral } from "../types.js";
import * as YAML from "../yaml.js";
import { transformAstBlockValue } from "./block-value.js";

export function transformBlockLiteral(
  blockLiteral: YAML.ast.BlockLiteral,
  context: Context,
): BlockLiteral {
  return createBlockLiteral(transformAstBlockValue(blockLiteral, context));
}
