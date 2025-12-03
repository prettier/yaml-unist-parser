import type * as YAML from "yaml";
import { createDirective } from "../factories/directive.js";
import type { Directive } from "../types.js";
import type Context from "./context.js";

export function transformDirective(
  directive: YAML.CST.Directive,
  context: Context,
): Directive {
  const parts = directive.source.trim().split(/[\t ]+/);
  const name = parts.shift()!.replace(/^%/, "");
  return createDirective(
    context.transformRange([
      directive.offset,
      directive.offset + directive.source.length,
    ]),
    name,
    parts,
  );
}
