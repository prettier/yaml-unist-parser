import { createBlockLiteral } from "../factories/block-literal";
import { Context } from "../transform";
import { BlockLiteral } from "../types";
import * as YAML from "../yaml";
import { transformAstBlockValue } from "./block-value";

export function transformBlockLiteral(
  blockLiteral: YAML.ast.BlockLiteral,
  context: Context,
): BlockLiteral {
  return createBlockLiteral(transformAstBlockValue(blockLiteral, context));
}
