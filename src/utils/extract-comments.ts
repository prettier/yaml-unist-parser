import { Context } from "../transform.js";
import { YAMLComment } from "../types.js";

export function extractComments<T extends null | object>(
  nodes: Array<T | YAMLComment>,
  context: Context,
): T[];
export function extractComments(
  nodes: Array<null | object | YAMLComment>,
  context: Context,
): Array<null | object> {
  const restNodes: Array<null | object> = [];

  for (const node of nodes) {
    if (node && "type" in node && node.type === "comment") {
      context.comments.push(context.transformNode(node));
    } else {
      restNodes.push(node);
    }
  }

  return restNodes;
}
