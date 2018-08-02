import assert = require("assert");
import { createAlias } from "../factories/alias";
import { Context } from "../transform";
import { Alias } from "../types";

export function tranformAlias(alias: yaml.Alias, context: Context): Alias {
  assert(alias.valueRange !== null);
  return createAlias(
    context.transformRange({
      start: alias.valueRange!.start - 1, // *
      end: alias.valueRange!.end,
    }),
    alias.rawValue,
  );
}
