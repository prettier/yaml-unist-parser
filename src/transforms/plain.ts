import { createPlain } from "../factories/plain";
import { Context } from "../transform";
import { Plain } from "../types";
import { findLastCharIndex } from "../utils/find-last-char-index";
import * as YAML from "../yaml";

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
