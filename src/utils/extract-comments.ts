import YAML from "yaml";
import { Context } from "../transform";

export function extractComments<T extends null | object>(
  nodes: Array<T | YAML.cst.Comment>,
  context: Context,
): T[];
export function extractComments(
  nodes: Array<null | object | YAML.cst.Comment>,
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
