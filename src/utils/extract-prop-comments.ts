import * as YAML from "yaml";
import { PropLeadingCharacter } from "../constants";
import { createComment } from "../factories/comment";
import { Context } from "../transform";

export function extractPropComments(
  node: YAML.cst.Node,
  context: Context,
): void {
  for (const propRange of node.props) {
    const leadingChar = context.text[propRange.origStart];
    switch (leadingChar) {
      case PropLeadingCharacter.Comment:
        context.comments.push(
          createComment(
            context.transformRange(propRange),
            context.text.slice(propRange.origStart + 1, propRange.origEnd),
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
