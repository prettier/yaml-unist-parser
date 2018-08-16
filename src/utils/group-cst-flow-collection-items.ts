import YAML from "yaml";
import { createSlicer } from "./create-slicer";

type CstFlowMapItemWithoutComment = Exclude<
  YAML.cst.FlowMap["items"][number],
  YAML.cst.Comment
>;

type CstFlowSeqItemWithoutComment = Exclude<
  YAML.cst.FlowSeq["items"][number],
  YAML.cst.Comment
>;

export function groupCstFlowCollectionItems<
  T extends CstFlowMapItemWithoutComment[] | CstFlowSeqItemWithoutComment[]
>(cstItems: T): T[];
export function groupCstFlowCollectionItems(
  cstItems: CstFlowMapItemWithoutComment[] | CstFlowSeqItemWithoutComment[],
) {
  const groups: Array<typeof cstItems> = [];
  const sliceCstItems = createSlicer(cstItems, 1); // exclude `{` or `[`

  let hasItem = false;

  for (let i = 1; i < cstItems.length - 1; i++) {
    const cstItem = cstItems[i];

    if ("char" in cstItem && cstItem.char === ",") {
      groups.push(sliceCstItems(i));
      sliceCstItems(i + 1); // exclude `,`
      hasItem = false;
      continue;
    }

    hasItem = true;
  }

  if (hasItem) {
    groups.push(sliceCstItems(cstItems.length - 1)); // exclude `}` or `]`
  }

  return groups;
}
