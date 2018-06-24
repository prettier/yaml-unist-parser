import assert = require("assert");
import { Context } from "../transform";
import { Plain } from "../types";
import {
  createCommentAttachableNode,
  createContentNode,
  findLastCharIndex,
} from "../utils";

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
      end: findLastCharIndex(context.text, plain.valueRange!.end - 1, /\S/) + 1,
    }),
    ...createCommentAttachableNode(),
    ...createContentNode(),
  };
}
