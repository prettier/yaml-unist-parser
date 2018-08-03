import assert = require("assert");
import YAML from "yaml";
import { createDirective } from "../factories/directive";
import { Context } from "../transform";
import { Directive } from "../types";

export function transformDirective(
  directive: YAML.cst.Directive,
  context: Context,
): Directive {
  assert(directive.range !== null);
  return createDirective(
    context.transformRange(directive.range!),
    directive.name,
    directive.parameters,
  );
}
