import type * as YAML from "yaml";
import { createPlain } from "../factories/plain.js";
import { type Plain } from "../types.js";
import { findLastCharIndex } from "../utils/find-last-char-index.js";
import type Context from "./context.js";

export function transformPlain(
  plain: YAML.AST.PlainValue,
  context: Context,
): Plain {
  const cstNode = plain.cstNode!;
  return createPlain(
    context.transformRange({
      origStart: cstNode.valueRange!.origStart!,
      origEnd:
        findLastCharIndex(
          context.text,
          cstNode.valueRange!.origEnd! - 1,
          /\S/,
        ) + 1,
    }),
    context.transformContent(plain),
    cstNode.strValue!,
  );
}
