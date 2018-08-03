import assert = require("assert");
import YAML from "yaml";
import { createFlowMapping } from "../factories/flow-mapping";
import { Context } from "../transform";
import { FlowMapping, FlowMappingItem } from "../types";
import { transformFlowCollection } from "./flowCollection";

export function transformFlowMap(
  flowCollection: YAML.cst.FlowCollection,
  context: Context,
): FlowMapping {
  assert(flowCollection.type === "FLOW_MAP");
  const transformed = transformFlowCollection(flowCollection, context);
  assert(transformed.children.every(item => item.type === "flowMappingItem"));
  const children = transformed.children as FlowMappingItem[];
  return createFlowMapping(transformed.position, children);
}
