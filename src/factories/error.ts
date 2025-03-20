import { type Position, type YAMLSyntaxError } from "../types.js";

export function createError(
  message: string,
  source: string,
  position: Position,
): YAMLSyntaxError {
  const error: Partial<YAMLSyntaxError> = new SyntaxError(message);
  error.name = "YAMLSyntaxError";
  error.source = source;
  error.position = position;
  return error as YAMLSyntaxError;
}
