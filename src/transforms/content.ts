import YAML from "yaml";
import { PropLeadingCharacter } from "../constants";
import { createAnchor } from "../factories/anchor";
import { createComment } from "../factories/comment";
import { createContent } from "../factories/content";
import { createTag } from "../factories/tag";
import { Context } from "../transform";
import { Anchor, Comment, Content, Tag } from "../types";

export function transformContent(
  node: YAML.ast.Node,
  context: Context,
  nonMiddleCommentHandler?: (nonMiddleComment: Comment) => void,
): Content {
  const cstNode = node.cstNode!;

  const middleComments: Comment[] = [];

  let firstTagOrAnchorRange: YAML.cst.Range | null = null;

  let tag: Tag | null = null;
  let anchor: Anchor | null = null;

  for (const propRange of cstNode.props) {
    const leadingChar = context.text[propRange.start];
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
          context.text.slice(propRange.start + 1, propRange.end),
        );
        context.comments.push(comment);
        if (
          firstTagOrAnchorRange &&
          firstTagOrAnchorRange.end <= propRange.start &&
          propRange.end <= cstNode.valueRange!.start
        ) {
          middleComments.push(comment);
        } else if (nonMiddleCommentHandler) {
          nonMiddleCommentHandler(comment);
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
