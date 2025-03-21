import type * as YAML from "yaml";
import { createBlockLiteral } from "../factories/block-literal.js";
import { type BlockLiteral } from "../types.js";
import { transformAstBlockValue } from "./block-value.js";
import type Context from "./context.js";

export function transformBlockLiteral(
  blockLiteral: YAML.AST.BlockLiteral,
  context: Context,
): BlockLiteral {
  return createBlockLiteral(transformAstBlockValue(blockLiteral, context));
}
