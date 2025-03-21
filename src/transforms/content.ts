import type * as YAML from "yaml";
import type * as YAMLTypes from "yaml/types";
import { PropLeadingCharacter } from "../constants.js";
import { createAnchor } from "../factories/anchor.js";
import { createComment } from "../factories/comment.js";
import { createContent } from "../factories/content.js";
import { createTag } from "../factories/tag.js";
import { type Anchor, type Comment, type Content, type Tag } from "../types.js";
import type Context from "./context.js";

export function transformContent(
  node: YAMLTypes.Node,
  context: Context,
  isNotMiddleComment: (comment: Comment) => boolean = () => false,
): Content {
  const cstNode = node.cstNode!;

  const middleComments: Comment[] = [];

  let firstTagOrAnchorRange: YAML.CST.Range | null = null;

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
