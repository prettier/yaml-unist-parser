import assert = require("assert");
import { Context } from "../transform";
import { Directive } from "../types";

export function transformDirective(
  directive: yaml.Directive,
  context: Context,
): Directive {
  assert(directive.range !== null);
  return {
    type: "directive",
    name: directive.name,
    parameters: directive.parameters,
    position: context.transformRange(directive.range!),
    leadingComments: [],
    middleComments: [],
    trailingComments: [],
  };
}
