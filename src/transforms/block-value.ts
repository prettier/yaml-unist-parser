import type * as YAML from "yaml";
import * as YAML_CST from "../cst.js";
import { createBlockValue } from "../factories/block-value.js";
import type { BlockValue, Comment } from "../types.js";
import type Context from "./context.js";
import type { TransformNodeProperties } from "./transform.js";

export function transformAstBlockValue(
  blockValue: YAML.Scalar.Parsed,
  srcToken: YAML.CST.BlockScalar,
  context: Context,
  props: TransformNodeProperties,
): BlockValue {
  let blockScalarHeaderToken: YAML_CST.BlockScalarHeaderSourceToken | null =
    null;
  let indicatorComment: Comment | null = null;
  for (const token of YAML_CST.tokens(srcToken.props)) {
    if (token.type === "comment") {
      indicatorComment = context.transformComment(token);
    } else if (token.type === "block-scalar-header") {
      blockScalarHeaderToken = token;
    } else {
      // istanbul ignore next -- @preserve
      throw new Error(
        `Unexpected token type in block value end: ${token.type}`,
      );
    }
  }

  // istanbul ignore if -- @preserve
  if (!blockScalarHeaderToken) {
    throw new Error("Expected block scalar header token");
  }

  const headerInfo = parseHeader(blockScalarHeaderToken.source);

  const position = context.transformRange({
    origStart: blockValue.range[0],
    origEnd: blockValue.range[1],
  });

  return createBlockValue(
    position,
    context.transformContentProperties(blockValue, props.tokens),
    headerInfo.chomping,
    headerInfo.indent,
    blockValue.source,
    indicatorComment,
  );
}

/**
 * Parse the block scalar header to extract indentation and chomping information.
 */
function parseHeader(header: string): {
  indent: number | null;
  chomping: "clip" | "keep" | "strip";
} {
  const parsed = /([+-]?)(\d*)([+-]?)$/u.exec(header);
  let indent: number | null = null;
  let chomping: "clip" | "keep" | "strip" = "clip";
  if (parsed) {
    indent = parsed[2] ? Number(parsed[2]) : null;
    const chompingStr = parsed[3] || parsed[1];
    chomping =
      chompingStr === "+" ? "keep" : chompingStr === "-" ? "strip" : "clip";
  }

  return {
    chomping,
    indent,
  };
}
