import YAML from "yaml";
import { createBlockValue } from "../factories/block-value";
import { Context } from "../transform";
import { BlockValue, Comment } from "../types";
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

  const hasExplicitBlockIndent =
    cstNode.header.length - indicatorLength - chompingLength !== 0;

  const position = context.transformRange({
    start: cstNode.header.start,
    end: cstNode.valueRange!.end,
  });

  const indicatorComments: Comment[] = [];
  const content = transformContent(blockValue, context, nonMiddleComment => {
    indicatorComments.push(nonMiddleComment);
  });

  return createBlockValue(
    position,
    content,
    Chomping[cstNode.chomping],
    hasExplicitBlockIndent ? cstNode.blockIndent! : null,
    cstNode.strValue!,
    indicatorComments,
  );
}
