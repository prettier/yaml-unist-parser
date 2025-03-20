import { createPlain } from "../factories/plain.js";
import { type Plain, type YAMLPlain } from "../types.js";
import { findLastCharIndex } from "../utils/find-last-char-index.js";
import type Context from "./context.js";

export function transformPlain(plain: YAMLPlain, context: Context): Plain {
  return createPlain(
    context.transformRange({
      origStart: plain.range![0],
      origEnd: findLastCharIndex(context.text, plain.range![1] - 1, /\S/) + 1,
    }),
    context.transformContent(plain),
    plain.value,
  );
}
