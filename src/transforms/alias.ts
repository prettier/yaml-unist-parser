import YAML from "yaml";

import { createAlias } from "../factories/alias.js";
import { Context } from "../transform.js";
import { Alias } from "../types.js";

export function transformAlias(alias: YAML.Alias, context: Context): Alias {
  return createAlias(
    context.transformRange({
      origStart: alias.range![0] - 1, // include the `*`
      origEnd: alias.range![1],
    }),
    context.transformContent(alias),
    alias.source,
  );
}
