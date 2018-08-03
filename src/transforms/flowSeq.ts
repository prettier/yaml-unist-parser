import assert = require("assert");
import YAML from "yaml";
import { createFlowSequence } from "../factories/flow-sequence";
import { Context } from "../transform";
import { FlowSequence } from "../types";
import { transformFlowCollection } from "./flowCollection";

export function transformFlowSeq(
  flowCollection: YAML.cst.FlowCollection,
  context: Context,
): FlowSequence {
  assert(flowCollection.type === "FLOW_SEQ");
  const transformed = transformFlowCollection(flowCollection, context);
  return createFlowSequence(transformed.position, transformed.children);
}
