import YAML from "yaml";
import { createFlowMappingItem } from "../factories/flow-mapping-item";
import { createMappingItem } from "../factories/mapping-item";
import { createMappingKey } from "../factories/mapping-key";
import { createMappingValue } from "../factories/mapping-value";
import { createEmptyPosition, createPosition } from "../factories/position";
import { Context } from "../transform";
import { FlowMappingItem, MappingItem } from "../types";
import { Range } from "./range";

export function transformAstPair(
  pair: YAML.ast.Pair | YAML.ast.Merge,
  context: Context,
  createNode: typeof createMappingItem,
  additionalKeyRange: null | Range,
  additionalValueRange: null | Range,
): MappingItem;
export function transformAstPair(
  pair: YAML.ast.Pair | YAML.ast.Merge,
  context: Context,
  createNode: typeof createFlowMappingItem,
  additionalKeyRange: null | Range,
  additionalValueRange: null | Range,
): FlowMappingItem;
export function transformAstPair(
  pair: YAML.ast.Pair | YAML.ast.Merge,
  context: Context,
  createNode: typeof createMappingItem | typeof createFlowMappingItem,
  additionalKeyRange: null | Range,
  additionalValueRange: null | Range,
): MappingItem | FlowMappingItem {
  const keyContent = context.transformNode(pair.key);
  const valueContent = context.transformNode(
    pair.type === "MERGE_PAIR"
      ? (pair.value.items[0] as YAML.ast.Alias)
      : pair.value,
  );

  const mappingKey =
    keyContent || additionalKeyRange
      ? createMappingKey(
          context.transformRange({
            start: additionalKeyRange
              ? additionalKeyRange.start
              : keyContent!.position.start.offset,
            end: keyContent
              ? keyContent.position.end.offset
              : additionalKeyRange!.start + 1,
          }),
          keyContent,
        )
      : null;

  const mappingValue =
    valueContent || additionalValueRange
      ? createMappingValue(
          context.transformRange({
            start: additionalValueRange
              ? additionalValueRange.start
              : // istanbul ignore next
                valueContent!.position.start.offset,
            end: valueContent
              ? valueContent.position.end.offset
              : additionalValueRange!.start + 1,
          }),
          valueContent,
        )
      : null;

  return createNode(
    createPosition(
      mappingKey ? mappingKey.position.start : mappingValue!.position.start,
      mappingValue ? mappingValue.position.end : mappingKey!.position.end,
    ),
    mappingKey ||
      createMappingKey(createEmptyPosition(mappingValue!.position.start), null),
    mappingValue ||
      createMappingValue(createEmptyPosition(mappingKey!.position.end), null),
  );
}
