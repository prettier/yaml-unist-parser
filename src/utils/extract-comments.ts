import type Context from "../transforms/context.js";
import type * as YAML from "yaml";

export function extractComments<T extends null | object>(
  nodes: Array<T | YAML.CST.Comment>,
  context: Context,
): T[];
export function extractComments(
  nodes: Array<null | object | YAML.CST.Comment>,
  context: Context,
): Array<null | object> {
  const restNodes: Array<null | object> = [];

  for (const node of nodes) {
    if (node && "type" in node && node.type === "COMMENT") {
      context.comments.push(context.transformNode(node));
    } else {
      restNodes.push(node);
    }
  }

  return restNodes;
}
