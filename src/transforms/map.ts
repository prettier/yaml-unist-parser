import assert = require("assert");
import { createMapping } from "../factories/mapping";
import { createMappingItem } from "../factories/mapping-item";
import { createMappingKey } from "../factories/mapping-key";
import { createPosition } from "../factories/position";
import { Context } from "../transform";
import { Mapping, MappingItem, MappingKey, MappingValue } from "../types";
import { getLast } from "../utils";

export function transformMap(map: yaml.Map, context: Context): Mapping {
  assert(map.valueRange !== null);
  const children = transformMapItems(map.items, context);
  return createMapping(
    createPosition(children[0].position.start, getLast(children)!.position.end),
    children,
  );
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
          buffer.push(createMappingKey(key.position, key));
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
            .map(currentMappingKey =>
              createMappingItem(
                currentMappingKey.position,
                currentMappingKey,
                context.transformNode(null),
              ),
            ),
        );
      }

      const mappingValue = context.transformNode(item) as MappingValue;

      assert(buffer.length <= 1);

      const mappingKey: MappingKey =
        buffer.length !== 0
          ? buffer.pop()!
          : createMappingKey(
              createPosition(
                mappingValue.position.start,
                mappingValue.position.start,
              ),
              context.transformNode(null),
            );

      return reduced.concat(
        createMappingItem(
          createPosition(mappingKey.position.start, mappingValue.position.end),
          mappingKey,
          mappingValue,
        ),
      );
    },
    [] as MappingItem[],
  );
}
