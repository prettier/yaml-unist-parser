import { BlockLiteral, BlockValue } from "../types";

export function createBlockLiteral(blockValue: BlockValue): BlockLiteral {
  return {
    ...blockValue,
    type: "blockLiteral",
  };
}
