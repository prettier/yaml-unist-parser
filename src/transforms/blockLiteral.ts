import assert = require("assert");
import { Context } from "../transform";
import { BlockLiteral } from "../types";
import { tranformBlockValue } from "./blockValue";

export function tranformBlockLiteral(
  blockLiteral: yaml.BlockValue,
  context: Context,
): BlockLiteral {
  assert(blockLiteral.type === "BLOCK_LITERAL");
  return {
    ...tranformBlockValue(blockLiteral, context),
    type: "blockLiteral",
  };
}
