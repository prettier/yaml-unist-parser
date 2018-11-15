import * as YAML from "yaml";
import { createAlias } from "../factories/alias";
import { Context } from "../transform";
import { Alias } from "../types";

export function transformAlias(alias: YAML.ast.Alias, context: Context): Alias {
  const cstNode = alias.cstNode!;
  return createAlias(
    context.transformRange({
      start: cstNode.valueRange!.start - 1, // include the `*`
      end: cstNode.valueRange!.end,
    }),
    context.transformContent(alias),
    cstNode.rawValue,
  );
}
