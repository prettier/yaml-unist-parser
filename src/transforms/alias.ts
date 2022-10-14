import { createAlias } from "../factories/alias.js";
import { Context } from "../transform.js";
import { Alias } from "../types.js";
import * as YAML from "../yaml.js";

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
