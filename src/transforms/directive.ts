import { createDirective } from "../factories/directive.js";
import { Context } from "../transform.js";
import { Directive } from "../types.js";
import { extractPropComments } from "../utils/extract-prop-comments.js";
import * as YAML from "../yaml.js";

export function transformDirective(
  directive: YAML.cst.Directive,
  context: Context,
): Directive {
  extractPropComments(directive, context);
  return createDirective(
    context.transformRange(directive.range!),
    directive.name,
    directive.parameters,
  );
}
