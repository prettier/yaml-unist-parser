import { createFlowMappingItem } from "../factories/flow-mapping-item.js";
import { createMappingItem } from "../factories/mapping-item.js";
import { createMappingKey } from "../factories/mapping-key.js";
import { createMappingValue } from "../factories/mapping-value.js";
import { createEmptyPosition, createPosition } from "../factories/position.js";
import { Context } from "../transform.js";
import {
  Comment,
  Directive,
  Document,
  FlowMappingItem,
  MappingItem,
} from "../types.js";
import * as YAML from "../yaml.js";
import { Range } from "./range.js";

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
