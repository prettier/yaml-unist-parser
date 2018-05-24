import assert = require("assert");
import { Context } from "../transform";
import { FlowMapping, FlowMappingItem } from "../types";
import { transformFlowCollection } from "./flowCollection";

export function transformFlowMap(
  flowCollection: yaml.FlowCollection,
  context: Context,
): FlowMapping {
  assert(flowCollection.type === "FLOW_MAP");
  const transformed = transformFlowCollection(flowCollection, context);
  assert(transformed.children.every(item => item.type === "flowMappingItem"));
  return {
    ...(transformed as (typeof transformed) & { children: FlowMappingItem[] }),
    type: "flowMapping",
  };
}
