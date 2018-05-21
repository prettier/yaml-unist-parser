import assert = require("assert");
import { Context } from "../transform";
import { BlockValue } from "../types";
import { transformRange } from "./range";

enum Chomping {
  CLIP = "clip",
  STRIP = "strip",
  KEEP = "keep",
}

export function tranformBlockValue(
  blockValue: yaml.BlockValue,
  context: Context,
): BlockValue {
  assert(blockValue.valueRange !== null);
  assert(blockValue.strValue !== null);

  const indicatorLength = 1; // | or >
  const chompingLength = blockValue.chomping === "CLIP" ? 0 : 1;
  const hasExplicitBlockIndent =
    blockValue.header.length - indicatorLength - chompingLength !== 0;

  assert(!hasExplicitBlockIndent || blockValue.blockIndent !== null);

  return {
    type: "blockBase",
    position: transformRange(
      {
        start: blockValue.header.start,
        end: blockValue.valueRange!.end,
      },
      context,
    ),
    chomping: Chomping[blockValue.chomping],
    indent: hasExplicitBlockIndent ? blockValue.blockIndent! : undefined,
    value: blockValue.strValue!,
    leadingComments: [],
    middleComments: [],
    trailingComments: [],
  };
}
