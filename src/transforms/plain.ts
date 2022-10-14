import { createPlain } from "../factories/plain.js";
import { Context } from "../transform.js";
import { Plain } from "../types.js";
import { findLastCharIndex } from "../utils/find-last-char-index.js";
import * as YAML from "../yaml.js";

export function transformPlain(
  plain: YAML.ast.PlainValue,
  context: Context,
): Plain {
  const cstNode = plain.cstNode!;
  return createPlain(
    context.transformRange({
      origStart: cstNode.valueRange!.origStart,
      origEnd:
        findLastCharIndex(context.text, cstNode.valueRange!.origEnd - 1, /\S/) +
        1,
    }),
    context.transformContent(plain),
    cstNode.strValue!,
  );
}
