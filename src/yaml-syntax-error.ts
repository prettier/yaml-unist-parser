import type * as YAML from "yaml";
import type Context from "./transforms/context.ts";
import { type Position } from "./types";

export class YAMLSyntaxError extends SyntaxError {
  name = "YAMLSyntaxError";

  code: YAML.ErrorCode;

  source: string;
  position: Position;

  constructor(context: Context, error: YAML.YAMLError) {
    super(error.message, { cause: error });

    this.code = error.code;

    this.source = context.text;
    this.position = context.transformRange(error.pos);
  }
}
