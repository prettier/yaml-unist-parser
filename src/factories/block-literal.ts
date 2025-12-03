import { type BlockLiteral, type BlockValue } from "../types.ts";

export function createBlockLiteral(blockValue: BlockValue): BlockLiteral {
  return {
    ...blockValue,
    type: "blockLiteral",
  };
}
