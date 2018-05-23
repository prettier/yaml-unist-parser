import assert = require("assert");
import { Context } from "../transform";
import { Alias } from "../types";
import { createCommentAttachableNode, createContentNode } from "../utils";

export function tranformAlias(alias: yaml.Alias, context: Context): Alias {
  assert(alias.valueRange !== null);
  return {
    type: "alias",
    position: context.transformRange({
      start: alias.valueRange!.start - 1, // *
      end: alias.valueRange!.end,
    }),
    value: alias.rawValue,
    ...createCommentAttachableNode(),
    ...createContentNode(),
  };
}
