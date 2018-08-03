import assert = require("assert");
import YAML from "yaml";
import { createPlain } from "../factories/plain";
import { Context } from "../transform";
import { Plain } from "../types";
import { findLastCharIndex } from "../utils";

export function transformPlain(
  plain: YAML.cst.PlainValue,
  context: Context,
): Plain {
  assert(plain.strValue !== null);
  assert(plain.valueRange !== null);
  return createPlain(
    context.transformRange({
      start: plain.valueRange!.start,
      end: findLastCharIndex(context.text, plain.valueRange!.end - 1, /\S/) + 1,
    }),
    plain.strValue!,
  );
}
