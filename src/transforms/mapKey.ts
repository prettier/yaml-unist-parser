import assert = require("assert");
import YAML from "yaml";
import { createMappingKey } from "../factories/mapping-key";
import { createPosition } from "../factories/position";
import { Context } from "../transform";
import { MappingKey } from "../types";

export function transformMapKey(
  mapKey: YAML.cst.MapItem,
  context: Context,
): MappingKey {
  assert(mapKey.type === "MAP_KEY");
  assert(mapKey.valueRange !== null);
  assert(mapKey.node === null || mapKey.node.type !== "COMMENT");

  const key = context.transformNode(mapKey.node as Exclude<
    typeof mapKey.node,
    YAML.cst.Comment
  >);

  const start = context.transformOffset(mapKey.valueRange!.start);

  return createMappingKey(
    createPosition(start, key === null ? start : key.position.end),
    key,
  );
}
