import { createDirective } from "../factories/directive.js";
import type Context from "./context.js";
import type { Directive, Range } from "../types.js";
import { extractPropComments } from "../utils/extract-prop-comments.js";
import type * as YAML from "../yaml.js";

export function transformDirective(
  directive: YAML.cst.Directive,
  context: Context,
): Directive {
  extractPropComments(directive, context);
  return createDirective(
    context.transformRange(directive.range as Range),
    directive.name,
    directive.parameters,
  );
}
