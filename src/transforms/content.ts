import { PropLeadingCharacter } from "../constants";
import { createAnchor } from "../factories/anchor";
import { createComment } from "../factories/comment";
import { createContent } from "../factories/content";
import { createTag } from "../factories/tag";
import { Context } from "../transform";
import { Anchor, Comment, Content, Tag } from "../types";
import * as YAML from "../yaml";

export function transformContent(
  node: YAML.ast.Node,
  context: Context,
  isNotMiddleComment: (comment: Comment) => boolean = () => false,
): Content {
  const cstNode = node.cstNode!;

  const middleComments: Comment[] = [];

  let firstTagOrAnchorRange: YAML.cst.Range | null = null;

  let tag: Tag | null = null;
  let anchor: Anchor | null = null;

  for (const propRange of cstNode.props) {
    const leadingChar = context.text[propRange.origStart];
    switch (leadingChar) {
      case PropLeadingCharacter.Tag:
        firstTagOrAnchorRange = firstTagOrAnchorRange || propRange;
        tag = createTag(context.transformRange(propRange), node.tag!);
        break;
      case PropLeadingCharacter.Anchor:
        firstTagOrAnchorRange = firstTagOrAnchorRange || propRange;
        anchor = createAnchor(
          context.transformRange(propRange),
          cstNode.anchor!,
        );
        break;
      case PropLeadingCharacter.Comment: {
        const comment = createComment(
          context.transformRange(propRange),
          context.text.slice(propRange.origStart + 1, propRange.origEnd),
        );
        context.comments.push(comment);
        if (
          !isNotMiddleComment(comment) &&
          firstTagOrAnchorRange &&
          firstTagOrAnchorRange.origEnd <= propRange.origStart &&
          propRange.origEnd <= cstNode.valueRange!.origStart
        ) {
          middleComments.push(comment);
        }
        break;
      }
      // istanbul ignore next
      default:
        throw new Error(
          `Unexpected leading character ${JSON.stringify(leadingChar)}`,
        );
    }
  }

  return createContent(tag, anchor, middleComments);
}
