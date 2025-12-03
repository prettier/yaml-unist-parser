import type * as YAML from "yaml";

// Subdivide YAML.CST.SourceToken
export type SpaceSourceToken = YAML.CST.SourceToken & {
  type: "space" | "newline";
};
export type CommentSourceToken = YAML.CST.SourceToken & { type: "comment" };
export type DocStartSourceToken = YAML.CST.SourceToken & { type: "doc-start" };
export type TagSourceToken = YAML.CST.SourceToken & { type: "tag" };
export type AnchorSourceToken = YAML.CST.SourceToken & { type: "anchor" };
export type SeqItemIndSourceToken = YAML.CST.SourceToken & {
  type: "seq-item-ind";
};
export type ExplicitKeyIndSourceToken = YAML.CST.SourceToken & {
  type: "explicit-key-ind";
};
export type MapValueIndSourceToken = YAML.CST.SourceToken & {
  type: "map-value-ind";
};
export type FlowMapEndSourceToken = YAML.CST.SourceToken & {
  type: "flow-map-end";
};
export type FlowSeqEndSourceToken = YAML.CST.SourceToken & {
  type: "flow-seq-end";
};
export type CommaSourceToken = YAML.CST.SourceToken & { type: "comma" };
export type BlockScalarHeaderSourceToken = YAML.CST.SourceToken & {
  type: "block-scalar-header";
};
export type OtherSourceToken = YAML.CST.SourceToken & {
  type: Exclude<
    YAML.CST.SourceToken["type"],
    (
      | SpaceSourceToken
      | CommentSourceToken
      | DocStartSourceToken
      | TagSourceToken
      | AnchorSourceToken
      | SeqItemIndSourceToken
      | ExplicitKeyIndSourceToken
      | MapValueIndSourceToken
      | FlowMapEndSourceToken
      | FlowSeqEndSourceToken
      | CommaSourceToken
      | BlockScalarHeaderSourceToken
    )["type"]
  >;
};
export type SourceToken =
  | CommentSourceToken
  | DocStartSourceToken
  | TagSourceToken
  | AnchorSourceToken
  | SeqItemIndSourceToken
  | ExplicitKeyIndSourceToken
  | MapValueIndSourceToken
  | FlowMapEndSourceToken
  | FlowSeqEndSourceToken
  | CommaSourceToken
  | BlockScalarHeaderSourceToken
  | OtherSourceToken;

// Subdivide YAML.CST.FlowScalar
export type DoubleQuotedFlowScalar = YAML.CST.FlowScalar & {
  type: "double-quoted-scalar";
};
export type SingleQuotedFlowScalar = YAML.CST.FlowScalar & {
  type: "single-quoted-scalar";
};
export type OtherFlowScalar = YAML.CST.FlowScalar & {
  type: Exclude<
    YAML.CST.FlowScalar["type"],
    (DoubleQuotedFlowScalar | SingleQuotedFlowScalar)["type"]
  >;
};
export type FlowScalar =
  | DoubleQuotedFlowScalar
  | SingleQuotedFlowScalar
  | OtherFlowScalar;

/**
 * Generator to iterate over tokens, skipping space and newline tokens.
 */
export function* tokens<T extends YAML.CST.Token>(
  ...tokensArgs: (Iterable<T> | undefined)[]
): Iterable<Exclude<T, YAML.CST.SourceToken> | SourceToken> {
  for (const tokens of tokensArgs) {
    if (!tokens) continue;
    for (const token of tokens) {
      if (isSpace(token)) continue;
      yield token as Exclude<T, YAML.CST.SourceToken> | SourceToken;
    }
  }
}

/**
 * Type guard to check if a token is a space or newline token.
 */
function isSpace<T extends YAML.CST.Token["type"]>(token: {
  type: T;
}): token is { type: T & ("space" | "newline") } {
  return token.type === "space" || token.type === "newline";
}

export type ContentPropertyToken =
  | CommentSourceToken
  | TagSourceToken
  | AnchorSourceToken;
/**
 * Type guard to check if a token is a content property token (comment, tag, or anchor).
 */
export function maybeContentPropertyToken(
  token: YAML.CST.SourceToken,
): token is ContentPropertyToken {
  return (
    token.type === "comment" || token.type === "tag" || token.type === "anchor"
  );
}
