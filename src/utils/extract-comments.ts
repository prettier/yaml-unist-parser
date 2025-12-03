import type * as YAML from "yaml";
import * as YAML_CST from "../cst.ts";
import type Context from "../transforms/context.ts";

export function extractComments<T extends YAML_CST.SourceToken>(
  tokens: T[] | undefined,
  context: Context,
): Exclude<T, YAML_CST.CommentSourceToken>[];
export function extractComments(
  tokens: YAML.CST.SourceToken[] | undefined,
  context: Context,
): YAML_CST.SourceToken[];
export function extractComments<T extends YAML_CST.SourceToken>(
  tokens: T[] | undefined,
  context: Context,
): Exclude<T, YAML_CST.CommentSourceToken>[] {
  const restNodes: Exclude<
    YAML_CST.SourceToken,
    YAML_CST.CommentSourceToken
  >[] = [];
  for (const token of YAML_CST.tokens(tokens)) {
    if (token.type === "comment") {
      context.transformComment(token);
    } else {
      restNodes.push(token);
    }
  }
  return restNodes as Exclude<T, YAML_CST.CommentSourceToken>[];
}
