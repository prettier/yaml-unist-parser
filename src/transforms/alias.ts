import assert = require("assert");
import { Context } from "../transform";
import { Alias } from "../types";
import { transformRange } from "./range";

export function tranformAlias(alias: yaml.Alias, context: Context): Alias {
  assert(alias.valueRange !== null);
  return {
    type: "alias",
    position: transformRange(
      {
        start: alias.valueRange!.start - 1, // *
        end: alias.valueRange!.end,
      },
      context,
    ),
    value: alias.rawValue,
    leadingComments: [],
    middleComments: [],
    trailingComments: [],
  };
}
