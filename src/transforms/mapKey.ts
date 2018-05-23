import assert = require("assert");
import { Context } from "../transform";
import { MappingKey } from "../types";
import { createCommentAttachableNode } from "../utils";

export function transformMapKey(
  mapKey: yaml.MapItem,
  context: Context,
): MappingKey {
  assert(mapKey.type === "MAP_KEY");
  assert(mapKey.valueRange !== null);
  assert(mapKey.node === null || mapKey.node.type !== "COMMENT");

  const key = context.transformNode(mapKey.node as Exclude<
    typeof mapKey.node,
    yaml.Comment
  >);

  return {
    type: "mappingKey",
    position: {
      start: context.transformOffset(mapKey.valueRange!.start),
      end: key.position.end,
    },
    children: [key],
    ...createCommentAttachableNode(),
  };
}
