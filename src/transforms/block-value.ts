import { createBlockValue } from "../factories/block-value.js";
import { Context } from "../transform.js";
import {
  BlockValue,
  Comment,
  YAMLBlockFolded,
  YAMLBlockLiteral,
} from "../types.js";
import { getPointText } from "../utils/get-point-text.js";
import { transformContent } from "./content.js";

enum Chomping {
  CLIP = "clip",
  STRIP = "strip",
  KEEP = "keep",
}

export function transformAstBlockValue(
  blockValue: YAMLBlockFolded | YAMLBlockLiteral,
  context: Context,
): BlockValue {
  const cstNode = blockValue.cstNode!;

  const indicatorLength = 1;
  const chompingLength = cstNode.chomping === "CLIP" ? 0 : 1;

  const headerLength = cstNode.header.origEnd - cstNode.header.origStart;
  const hasExplicitBlockIndent =
    headerLength - indicatorLength - chompingLength !== 0;

  const position = context.transformRange({
    origStart: cstNode.header.origStart,
    origEnd: cstNode.valueRange!.origEnd,
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
