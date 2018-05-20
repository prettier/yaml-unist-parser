import assert = require("assert");
import { Context } from "../transform";
import { Mapping, MappingItem, MappingKey, MappingValue } from "../types";
import { cloneObject, getLast } from "../utils";
import { transformComment } from "./comment";
import { transformNull } from "./null";
import { transformOffset } from "./offset";

export function transformMap(map: yaml.Map, context: Context): Mapping {
  assert(map.valueRange !== null);
  const children = transformMapItems(map.items, context);
  return {
    type: "mapping",
    position: cloneObject({
      start: children[0].position.start,
      end: getLast(children)!.position.end,
    }),
    children,
    leadingComments: [],
    trailingComments: [],
  };
}

function transformMapItems(
  items: yaml.Map["items"],
  context: Context,
): MappingItem[] {
  const itemsWithoutComments = items.filter(item => {
    if (item.type === "COMMENT") {
      context.comments.push(transformComment(item, context));
      return false;
    }
    return true;
  }) as Array<Exclude<(typeof items)[number], yaml.Comment>>;

  const buffer: MappingKey[] = [];
  return itemsWithoutComments.reduce(
    (reduced, item, index) => {
      if (item.type !== "MAP_VALUE") {
        assert(index !== itemsWithoutComments.length - 1);
        assert(
          item.type !== "MAP_KEY" ||
            (item.node === null || item.node.type !== "COMMENT"),
        );

        const key = context.transformNode(
          item.type === "MAP_KEY"
            ? (item.node as Exclude<typeof item.node, yaml.Comment>)
            : (item as Exclude<typeof item, yaml.MapItem>),
        );

        assert(item.type !== "MAP_KEY" || item.valueRange !== null);

        buffer.push({
          type: "mappingKey",
          position:
            item.type === "MAP_KEY"
              ? {
                  start: transformOffset(item.valueRange!.start, context),
                  end: cloneObject(key.position.end),
                }
              : cloneObject(key.position),
          children: [key],
          leadingComments: [],
          trailingComments: [],
        });

        return reduced;
      }

      assert(item.valueRange !== null);
      assert(item.node === null || item.node.type !== "COMMENT");

      const mappingValueNode = context.transformNode(item.node as Exclude<
        typeof item.node,
        yaml.Comment
      >);
      const mappingValue: MappingValue = {
        type: "mappingValue",
        position: cloneObject({
          start: transformOffset(item.valueRange!.start, context),
          end:
            mappingValueNode.type === "null"
              ? transformOffset(item.valueRange!.start + 1, context)
              : mappingValueNode.position.end,
        }),
        children: [mappingValueNode],
        leadingComments: [],
        trailingComments: [],
      };

      assert(buffer.length <= 1);

      const mappingKey: MappingKey =
        buffer.length !== 0
          ? buffer.pop()!
          : {
              type: "mappingKey",
              children: [transformNull()],
              position: {
                start: cloneObject(mappingValue.position.start),
                end: cloneObject(mappingValue.position.start),
              },
              leadingComments: [],
              trailingComments: [],
            };

      return reduced.concat({
        type: "mappingItem",
        children: [mappingKey, mappingValue],
        position: {
          start: cloneObject(mappingKey.position.start),
          end: cloneObject(mappingValue.position.end),
        },
        leadingComments: [],
        trailingComments: [],
      });
    },
    [] as MappingItem[],
  );
}
