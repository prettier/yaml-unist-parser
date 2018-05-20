import assert = require("assert");
import { Context } from "../transform";
import { FlowSequence } from "../types";
import { transformFlowCollection } from "./flowCollection";

export function transformFlowSeq(
  flowCollection: yaml.FlowCollection,
  context: Context,
): FlowSequence {
  assert(flowCollection.type === "FLOW_SEQ");
  return {
    ...transformFlowCollection(flowCollection, context),
    type: "flowSequence",
  };
}
