import { createFlowMappingItem } from "../factories/flow-mapping-item";
import { createMappingItem } from "../factories/mapping-item";
import { createMappingKey } from "../factories/mapping-key";
import { createMappingValue } from "../factories/mapping-value";
import { createEmptyPosition, createPosition } from "../factories/position";
import { Context } from "../transform";
import {
  Comment,
  Directive,
  Document,
  FlowMappingItem,
  MappingItem,
} from "../types";
import * as YAML from "../yaml";
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
  const valueContent = context.transformNode(pair.value);

  const mappingKey =
    keyContent || additionalKeyRange
      ? createMappingKey(
          context.transformRange({
            origStart: additionalKeyRange
              ? additionalKeyRange.origStart
              : keyContent!.position.start.offset,
            origEnd: keyContent
              ? keyContent.position.end.offset
              : additionalKeyRange!.origStart + 1,
          }),
          keyContent as Exclude<
            typeof keyContent,
            Comment | Directive | Document
          >,
        )
      : null;

  const mappingValue =
    valueContent || additionalValueRange
      ? createMappingValue(
          context.transformRange({
            origStart: additionalValueRange
              ? additionalValueRange.origStart
              : // istanbul ignore next
                valueContent!.position.start.offset,
            origEnd: valueContent
              ? valueContent.position.end.offset
              : additionalValueRange!.origStart + 1,
          }),
          valueContent as Exclude<
            typeof valueContent,
            Comment | Directive | Document
          >,
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
