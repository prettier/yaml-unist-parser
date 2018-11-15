import * as YAML from "yaml";
import { createPlain } from "../factories/plain";
import { Context } from "../transform";
import { Plain } from "../types";
import { findLastCharIndex } from "../utils/find-last-char-index";

export function transformPlain(
  plain: YAML.ast.PlainValue,
  context: Context,
): Plain {
  const cstNode = plain.cstNode!;
  return createPlain(
    context.transformRange({
      start: cstNode.valueRange!.start,
      end:
        findLastCharIndex(context.text, cstNode.valueRange!.end - 1, /\S/) + 1,
    }),
    context.transformContent(plain),
    cstNode.strValue!,
  );
}
