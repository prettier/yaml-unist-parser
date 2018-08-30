import YAML from "yaml";
import { createBlockValue } from "../factories/block-value";
import { Context } from "../transform";
import { BlockValue, Comment } from "../types";
import { getPointText } from "../utils/get-point-text";
import { transformContent } from "./content";

enum Chomping {
  CLIP = "clip",
  STRIP = "strip",
  KEEP = "keep",
}

export function transformAstBlockValue(
  blockValue: YAML.ast.BlockFolded | YAML.ast.BlockLiteral,
  context: Context,
): BlockValue {
  const cstNode = blockValue.cstNode!;

  const indicatorLength = 1;
  const chompingLength = cstNode.chomping === "CLIP" ? 0 : 1;

  const headerLength = cstNode.header.end - cstNode.header.start;
  const hasExplicitBlockIndent =
    headerLength - indicatorLength - chompingLength !== 0;

  const position = context.transformRange({
    start: cstNode.header.start,
    end: cstNode.valueRange!.end,
  });

  let indicatorComment: Comment | null = null;
  const content = transformContent(blockValue, context, comment => {
    const isIndicatorComment =
      position.start.offset < comment.position.start.offset &&
      comment.position.end.offset < position.end.offset;

    if (!isIndicatorComment) {
      return false;
    }

    // istanbul ignore next
    if (indicatorComment) {
      throw new Error(
        `Unexpected multiple indicator comments at ${getPointText(
          comment.position.start,
        )}`,
      );
    }

    indicatorComment = comment;
    return true;
  });

  return createBlockValue(
    position,
    content,
    Chomping[cstNode.chomping],
    hasExplicitBlockIndent ? cstNode.blockIndent! : null,
    cstNode.strValue!,
    indicatorComment,
  );
}
