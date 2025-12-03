import type * as YAML from "yaml";
import type * as YAML_CST from "../cst.js";
import { createAnchor } from "../factories/anchor.js";
import { createContent } from "../factories/content.js";
import { createTag } from "../factories/tag.js";
import type { Anchor, Comment, Content, Range, Tag } from "../types.js";
import type Context from "./context.js";

export function transformContentProperties(
  node:
    | YAML.ParsedNode
    | YAML.YAMLSeq.Parsed<
        YAML.ParsedNode | YAML.Pair<YAML.ParsedNode, YAML.ParsedNode | null>
      >,
  tokens: YAML_CST.ContentPropertyToken[],
  context: Context,
): Content {
  const middleComments: Comment[] = [];

  let firstTagOrAnchorRange: Range | null = null;

  let tag: Tag | null = null;
  let anchor: Anchor | null = null;

  for (const token of tokens) {
    const tokenRange: Range = {
      origStart: token.offset,
      origEnd: token.offset + token.source.length,
    };
    switch (token.type) {
      case "tag":
        {
          firstTagOrAnchorRange = firstTagOrAnchorRange || tokenRange;
          let resolvedTag =
            node.tag ??
            token.source.slice(token.source.startsWith("!!") ? 2 : 1);
          if (resolvedTag === "!") {
            resolvedTag = "tag:yaml.org,2002:str";
          }
          tag = createTag(context.transformRange(tokenRange), resolvedTag);
        }
        break;
      case "anchor":
        firstTagOrAnchorRange = firstTagOrAnchorRange || tokenRange;
        anchor = createAnchor(context.transformRange(tokenRange), node.anchor!);
        break;
      case "comment": {
        const comment = context.transformComment(token);
        if (
          firstTagOrAnchorRange &&
          firstTagOrAnchorRange.origEnd <= tokenRange.origStart &&
          tokenRange.origEnd <= node.range[0]
        ) {
          middleComments.push(comment);
        }
        break;
      }
      // istanbul ignore next -- @preserve
      default:
        throw new Error(
          `Unexpected content property token type: ${(token as YAML.CST.Token).type}`,
        );
    }
  }

  return createContent(tag, anchor, middleComments);
}
