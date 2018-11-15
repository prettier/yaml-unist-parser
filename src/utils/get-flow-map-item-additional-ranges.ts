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
      ? { origStart: flowChar.origOffset, origEnd: flowChar.origOffset + 1 }
      : null;
  });

  return {
    additionalKeyRange: questionMarkRange,
    additionalValueRange: colonRange,
  };
}
