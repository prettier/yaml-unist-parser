import { createAlias } from "../factories/alias";
import { Context } from "../transform";
import { Alias } from "../types";
import * as YAML from "../yaml";

export function transformAlias(alias: YAML.ast.Alias, context: Context): Alias {
  const cstNode = alias.cstNode!;
  return createAlias(
    context.transformRange({
      origStart: cstNode.valueRange!.origStart - 1, // include the `*`
      origEnd: cstNode.valueRange!.origEnd,
    }),
    context.transformContent(alias),
    cstNode.rawValue,
  );
}
