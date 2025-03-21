import type * as YAML from "yaml";
import { PropLeadingCharacter } from "../constants.js";
import { createComment } from "../factories/comment.js";
import type Context from "../transforms/context.js";
import type { Range } from "../types.ts";

export function extractPropComments(
  node: YAML.CST.Node,
  context: Context,
): void {
  for (const propRange of node.props) {
    const leadingChar = context.text[propRange.origStart!];
    switch (leadingChar) {
      case PropLeadingCharacter.Comment:
        context.comments.push(
          createComment(
            context.transformRange(propRange as Range),
            context.text.slice(propRange.origStart! + 1, propRange.origEnd),
          ),
        );
        break;
      // istanbul ignore next
      default:
        throw new Error(
          `Unexpected leading character ${JSON.stringify(leadingChar)}`,
        );
    }
  }
}
