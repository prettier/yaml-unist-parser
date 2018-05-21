import assert = require("assert");
import { Context } from "../transform";
import { Directive } from "../types";
import { transformRange } from "./range";

export function transformDirective(
  directive: yaml.Directive,
  context: Context,
): Directive {
  assert(directive.range !== null);
  return {
    type: "directive",
    name: directive.name,
    parameters: directive.parameters,
    position: transformRange(directive.range!, context),
    leadingComments: [],
    middleComments: [],
    trailingComments: [],
  };
}
