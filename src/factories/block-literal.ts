import { type BlockLiteral, type BlockValue } from "../types.js";

export function createBlockLiteral(blockValue: BlockValue): BlockLiteral {
  return {
    ...blockValue,
    type: "blockLiteral",
  };
}
