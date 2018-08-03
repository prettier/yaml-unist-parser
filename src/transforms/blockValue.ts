import assert = require("assert");
import YAML from "yaml";
import { createBlockValue } from "../factories/block-value";
import { Context } from "../transform";
import { BlockValue } from "../types";

enum Chomping {
  CLIP = "clip",
  STRIP = "strip",
  KEEP = "keep",
}

export function tranformBlockValue(
  blockValue: YAML.cst.BlockValue,
  context: Context,
): BlockValue {
  assert(blockValue.valueRange !== null);
  assert(blockValue.strValue !== null);

  const indicatorLength = 1; // | or >
  const chompingLength = blockValue.chomping === "CLIP" ? 0 : 1;
  const hasExplicitBlockIndent =
    blockValue.header.length - indicatorLength - chompingLength !== 0;

  assert(!hasExplicitBlockIndent || blockValue.blockIndent !== null);

  return createBlockValue(
    context.transformRange({
      start: blockValue.header.start,
      end: blockValue.valueRange!.end,
    }),
    Chomping[blockValue.chomping],
    hasExplicitBlockIndent ? blockValue.blockIndent! : null,
    blockValue.strValue!,
  );
}
