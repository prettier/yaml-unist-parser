import assert = require("assert");
import YAML from "yaml";
import { createBlockLiteral } from "../factories/block-literal";
import { Context } from "../transform";
import { BlockLiteral } from "../types";
import { tranformBlockValue } from "./blockValue";

export function tranformBlockLiteral(
  blockLiteral: YAML.cst.BlockValue,
  context: Context,
): BlockLiteral {
  assert(blockLiteral.type === "BLOCK_LITERAL");
  return createBlockLiteral(tranformBlockValue(blockLiteral, context));
}
