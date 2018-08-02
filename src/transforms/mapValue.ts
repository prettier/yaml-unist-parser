import assert = require("assert");
import { createMappingValue } from "../factories/mapping-value";
import { createPosition } from "../factories/position";
import { Context } from "../transform";
import { MappingValue } from "../types";

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

  return createMappingValue(
    createPosition(
      context.transformOffset(mapValue.valueRange!.start),
      value.type === "null"
        ? context.transformOffset(mapValue.valueRange!.start + 1)
        : value.position.end,
    ),
    value,
  );
}
