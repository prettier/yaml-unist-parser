import type * as YAMLTypes from "yaml/types";
import { createAlias } from "../factories/alias.js";
import { type Alias } from "../types.js";
import type Context from "./context.js";

export function transformAlias(
  alias: YAMLTypes.Alias,
  context: Context,
): Alias {
  const cstNode = alias.cstNode!;
  return createAlias(
    context.transformRange({
      origStart: cstNode.valueRange!.origStart! - 1, // include the `*`
      origEnd: cstNode.valueRange!.origEnd!,
    }),
    context.transformContent(alias),
    cstNode.rawValue,
  );
}
