import type * as YAML from "yaml";
import type Context from "./transforms/context.ts";
import { type Position } from "./types";

export class YAMLSyntaxError extends SyntaxError {
  name = "YAMLSyntaxError";
  source: string;
  code: YAML.ErrorCode;
  position: Position;

  constructor(context: Context, error: YAML.YAMLError) {
    super(error.message, { cause: error });

    this.source = context.text;
    this.code = error.code;
    this.position = context.transformRange(error.pos);
  }
}
