import type YAML from "yaml";

import { createAlias } from "../factories/alias.js";
import type Context from "./context.js";
import { type Alias } from "../types.js";

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
