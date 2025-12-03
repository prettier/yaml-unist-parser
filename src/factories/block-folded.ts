import { type BlockFolded, type BlockValue } from "../types.ts";

export function createBlockFolded(blockValue: BlockValue): BlockFolded {
  return {
    ...blockValue,
    type: "blockFolded",
  };
}
