import assert = require("assert");
import { Context } from "../transform";
import { MappingValue } from "../types";
import { cloneObject } from "../utils";
import { transformOffset } from "./offset";

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
    position: cloneObject({
      start: transformOffset(mapValue.valueRange!.start, context),
      end:
        value.type === "null"
          ? transformOffset(mapValue.valueRange!.start + 1, context)
          : value.position.end,
    }),
    children: [value],
    leadingComments: [],
    middleComments: [],
    trailingComments: [],
  };
}
