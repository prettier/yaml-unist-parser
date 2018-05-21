import assert = require("assert");
import { Context } from "../transform";
import { Plain } from "../types";

export function transformPlain(
  plain: yaml.PlainValue,
  context: Context,
): Plain {
  assert(plain.strValue !== null);
  assert(plain.valueRange !== null);
  return {
    type: "plain",
    value: plain.strValue!,
    position: context.transformRange({
      start: plain.valueRange!.start,
      end: plain.valueRange!.start + plain.strValue!.length,
    }),
    leadingComments: [],
    middleComments: [],
    trailingComments: [],
  };
}
