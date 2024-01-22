import YAML from "yaml";

import { createDirective } from "../factories/directive.js";
import { Context } from "../transform.js";
import { Directive } from "../types.js";
import { extractPropComments } from "../utils/extract-prop-comments.js";

export function transformDirective(
  directive: YAML.CST.Directive,
  context: Context,
): Directive {
  extractPropComments(directive, context);
  return createDirective(
    context.transformRange(directive.range!),
    directive.name,
    directive.parameters,
  );
}
