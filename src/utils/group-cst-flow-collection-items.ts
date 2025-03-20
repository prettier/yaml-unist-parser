import type YAML from "yaml";
import { createSlicer } from "./create-slicer.js";
import { type YAMLComment } from "../types.js";

export type CstFlowMapItemWithoutComment = Exclude<
  YAML.CST.FlowCollection["items"][number],
  YAMLComment
>;

export type CstFlowSeqItemWithoutComment = Exclude<
  YAML.CST.FlowCollection["items"][number],
  YAMLComment
>;

export function groupCstFlowCollectionItems<
  T extends CstFlowMapItemWithoutComment[] | CstFlowSeqItemWithoutComment[],
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
