import assert = require("assert");
import { Context } from "../transform";
import { MappingValue } from "../types";
import { createCommentAttachableNode } from "../utils";

export function transformMapValue(
  mapValue: yaml.MapItem,
  context: Context,
): MappingValue {
  assert(mapValue.valueRange !== null);
  assert(mapValue.node === null || mapValue.node.type !== "COMMENT");

  const value = context.transformNode(mapValue.node as Exclude<
    typeof mapValue.node,
    yaml.Comment
  >);

  return {
    type: "mappingValue",
    position: {
      start: context.transformOffset(mapValue.valueRange!.start),
      end:
        value.type === "null"
          ? context.transformOffset(mapValue.valueRange!.start + 1)
          : value.position.end,
    },
    children: [value],
    ...createCommentAttachableNode(),
  };
}
