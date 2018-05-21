import assert = require("assert");
import { Context } from "../transform";
import { Mapping, MappingItem, MappingKey, MappingValue } from "../types";
import { cloneObject, getLast } from "../utils";

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
    middleComments: [],
    trailingComments: [],
  };
}

function transformMapItems(
  items: yaml.Map["items"],
  context: Context,
): MappingItem[] {
  const itemsWithoutComments = items.filter(item => {
    if (item.type === "COMMENT") {
      context.comments.push(context.transformNode(item));
      return false;
    }
    return true;
  }) as Array<Exclude<(typeof items)[number], yaml.Comment>>;

  const buffer: MappingKey[] = [];
  return itemsWithoutComments.reduce(
    (reduced, item, index) => {
      if (item.type !== "MAP_VALUE") {
        if (item.type === "MAP_KEY") {
          buffer.push(context.transformNode(item) as MappingKey);
        } else {
          const key = context.transformNode(item as Exclude<
            typeof item,
            yaml.MapItem
          >);
          buffer.push({
            type: "mappingKey",
            position: cloneObject(key.position),
            children: [key],
            leadingComments: [],
            middleComments: [],
            trailingComments: [],
          });
        }

        if (buffer.length === 1 && index !== itemsWithoutComments.length - 1) {
          return reduced;
        }

        let unshiftCount = 0;

        if (buffer.length !== 1) {
          unshiftCount++;
          assert(itemsWithoutComments[index - 1].type === "MAP_KEY");
        }

        if (index === itemsWithoutComments.length - 1) {
          unshiftCount++;
          assert(itemsWithoutComments[index].type === "MAP_KEY");
        }

        return reduced.concat(
          buffer
            .splice(0, unshiftCount)
            .map((currentMappingKey): MappingItem => ({
              type: "mappingItem",
              children: [
                currentMappingKey,
                {
                  type: "mappingValue",
                  children: [context.transformNode(null)],
                  position: context.transformRange(
                    currentMappingKey.position.end.offset,
                  ),
                  leadingComments: [],
                  middleComments: [],
                  trailingComments: [],
                },
              ],
              position: cloneObject(currentMappingKey.position),
              leadingComments: [],
              middleComments: [],
              trailingComments: [],
            })),
        );
      }

      const mappingValue = context.transformNode(item) as MappingValue;

      assert(buffer.length <= 1);

      const mappingKey: MappingKey =
        buffer.length !== 0
          ? buffer.pop()!
          : {
              type: "mappingKey",
              children: [context.transformNode(null)],
              position: {
                start: cloneObject(mappingValue.position.start),
                end: cloneObject(mappingValue.position.start),
              },
              leadingComments: [],
              middleComments: [],
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
        middleComments: [],
        trailingComments: [],
      });
    },
    [] as MappingItem[],
  );
}
