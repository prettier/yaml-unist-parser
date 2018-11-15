import * as YAML from "yaml";

export function getFlowMapItemAdditionalRanges(
  cstNodes: YAML.cst.FlowMap["items"],
) {
  const [questionMarkRange, colonRange] = ["?", ":"].map(char => {
    const flowChar = cstNodes.find(
      (cstNode): cstNode is YAML.cst.FlowChar =>
        "char" in cstNode && cstNode.char === char,
    );
    return flowChar
      ? { start: flowChar.offset, end: flowChar.offset + 1 }
      : null;
  });

  return {
    additionalKeyRange: questionMarkRange,
    additionalValueRange: colonRange,
  };
}
