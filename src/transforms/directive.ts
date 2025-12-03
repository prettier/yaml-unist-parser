import type * as YAML from "yaml";
import { createDirective } from "../factories/directive.ts";
import type { Directive } from "../types.ts";
import type Context from "./context.ts";

export function transformDirective(
  directive: YAML.CST.Directive,
  context: Context,
): Directive {
  const parts = directive.source.trim().split(/[\t ]+/);
  const name = parts.shift()!.replace(/^%/, "");
  return createDirective(
    context.transformRange({
      origStart: directive.offset,
      origEnd: directive.offset + directive.source.length,
    }),
    name,
    parts,
  );
}
