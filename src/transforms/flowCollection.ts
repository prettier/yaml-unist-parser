import assert = require("assert");
import { createFlowCollection } from "../factories/flow-collection";
import { createFlowMappingItem } from "../factories/flow-mapping-item";
import { createFlowSequenceItem } from "../factories/flow-sequence-item";
import { createMappingKey } from "../factories/mapping-key";
import { createMappingValue } from "../factories/mapping-value";
import { createPosition } from "../factories/position";
import { Context } from "../transform";
import {
  ContentNode,
  FlowCollection,
  FlowMappingItem,
  FlowSequenceItem,
} from "../types";
import { getLast } from "../utils";

type ItemBuffer = Array<"," | "?" | ":" | ContentNode>;
type RangeBuffer = Array<{ start: number; end: number }>;

export function transformFlowCollection(
  flowCollection: yaml.FlowCollection,
  context: Context,
): FlowCollection {
  assert(flowCollection.valueRange !== null);

  assert(flowCollection.items.length >= 2);

  assert(
    flowCollection.type === "FLOW_MAP"
      ? flowCollection.items[0] === "{" &&
        getLast(flowCollection.items)! === "}"
      : flowCollection.items[0] === "[" &&
        getLast(flowCollection.items)! === "]",
  );

  let hasColon = false;
  let hasQuestion = false;

  const children: Array<FlowSequenceItem | FlowMappingItem> = [];

  let itemBuffer: ItemBuffer = [];
  let rangeBuffer: RangeBuffer = [];

  let lastItemStartOffset = flowCollection.valueRange!.start; // start marker
  let lastItemEndOffset = lastItemStartOffset + 1;

  const lastIndex = flowCollection.items.length - 2;
  for (let i = 1; i <= lastIndex; i++) {
    let isComment = false;
    const item = flowCollection.items[i];

    // istanbul ignore if
    if (item === "{" || item === "}" || item === "[" || item === "]") {
      assert(true);
      continue; // convince control flow analysis
    } else if (typeof item === "object" && item.type === "COMMENT") {
      isComment = true;
      const comment = context.transformNode(item);
      context.comments.push(comment);
      lastItemStartOffset = comment.position.start.offset;
      lastItemEndOffset = comment.position.end.offset;
    } else {
      if (item === "?") {
        assert(!hasColon);
        assert(!hasQuestion);
        hasQuestion = true;
      } else if (item === ":") {
        assert(!hasColon);
        hasColon = true;
      }
      pushBuffer(typeof item === "string" ? item : context.transformNode(item));
    }

    if (i === lastIndex && itemBuffer.length === 0 && isComment) {
      break;
    }

    if (item === "," || i === lastIndex) {
      children.push(
        transformFlowCollectionItems(
          flowCollection.type,
          itemBuffer,
          rangeBuffer,
          context,
        ),
      );
      itemBuffer = [];
      rangeBuffer = [];
      hasColon = false;
      hasQuestion = false;
    }
  }

  return createFlowCollection(
    context.transformRange(flowCollection.valueRange!),
    children,
  );

  function pushBuffer(item: ItemBuffer[number]) {
    const { start, end } = getItemRange(item);

    lastItemStartOffset = start;
    lastItemEndOffset = end;

    itemBuffer.push(item);
    rangeBuffer.push({ start, end });
  }

  function getItemRange(item: ItemBuffer[number]) {
    if (typeof item !== "string") {
      return {
        start: item.position.start.offset,
        end: item.position.end.offset,
      };
    }

    const start = context.text.indexOf(item, lastItemEndOffset);
    return {
      start,
      end: start + item.length,
    };
  }
}

function transformFlowCollectionItems(
  type: yaml.FlowCollection["type"],
  itemBuffer: ItemBuffer,
  rangeBuffer: RangeBuffer,
  context: Context,
): FlowMappingItem | FlowSequenceItem {
  assert(itemBuffer.length === rangeBuffer.length);

  const commaIndex = itemBuffer.indexOf(",");
  assert(commaIndex === -1 || commaIndex === itemBuffer.length - 1);

  const itemBufferWithoutComma = (commaIndex === -1
    ? itemBuffer
    : itemBuffer.slice(0, -1)) as Array<
    Exclude<(typeof itemBuffer)[number], ",">
  >;

  assert(
    itemBufferWithoutComma.length > 0 && itemBufferWithoutComma.length <= 4,
  );

  if (itemBufferWithoutComma.length === 1) {
    const item = itemBufferWithoutComma[0];
    if (typeof item === "string") {
      // [ ? ] or [ : ]
      // { ? } or { : }
      const range = rangeBuffer[0];
      const position = context.transformRange(range);
      return createFlowMappingItem(
        position,
        item === "?"
          ? createMappingKey(
              context.transformRange(range),
              context.transformNode(null),
            )
          : context.transformNode(null),
        item === ":"
          ? createMappingValue(
              context.transformRange(range),
              context.transformNode(null),
            )
          : context.transformNode(null),
      );
    } else {
      // [ 123 ] or { 123 }
      return type === "FLOW_MAP"
        ? createFlowMappingItem(
            item.position,
            createMappingKey(item.position, item),
            context.transformNode(null),
          )
        : createFlowSequenceItem(item.position, item);
    }
  }

  const colonIndex = itemBuffer.indexOf(":");
  const questionIndex = itemBuffer.indexOf("?");

  if (itemBufferWithoutComma.length === 2) {
    if (questionIndex !== -1 && colonIndex !== -1) {
      // [ ? : ] or { ? : }
      const questionRange = rangeBuffer[0];
      const colonRange = rangeBuffer[1];
      return createFlowMappingItem(
        context.transformRange({
          start: questionRange.start,
          end: colonRange.end,
        }),
        createMappingKey(
          context.transformRange(questionRange),
          context.transformNode(null),
        ),
        createMappingValue(
          context.transformRange(colonRange),
          context.transformNode(null),
        ),
      );
    } else if (questionIndex !== -1) {
      // [ ? 123 ] or { ? 123 }
      assert(questionIndex === 0);
      const questionRange = rangeBuffer[0];
      const key = itemBufferWithoutComma[1] as ContentNode;
      const keyPosition = {
        start: context.transformOffset(questionRange.start),
        end: key.position.end,
      };
      return createFlowMappingItem(
        keyPosition,
        createMappingKey(keyPosition, key),
        context.transformNode(null),
      );
    } else if (colonIndex === 0) {
      // [ : 123 ] or { : 123 }
      const colonRange = rangeBuffer[0];
      const value = itemBufferWithoutComma[1] as ContentNode;
      const valuePosition = {
        start: context.transformOffset(colonRange.start),
        end: value.position.end,
      };
      return createFlowMappingItem(
        valuePosition,
        context.transformNode(null),
        createMappingValue(valuePosition, value),
      );
    } else {
      // [ 123 : ] or { 123 : }
      assert(colonIndex === 1);
      const colonRange = rangeBuffer[1];
      const key = itemBufferWithoutComma[0] as ContentNode;
      return createFlowMappingItem(
        createPosition(
          key.position.start,
          context.transformOffset(colonRange.end),
        ),
        createMappingKey(key.position, key),
        createMappingValue(
          context.transformRange(colonRange),
          context.transformNode(null),
        ),
      );
    }
  } else if (itemBufferWithoutComma.length === 3) {
    if (questionIndex === -1) {
      // [ 123 : 123 ] or { 123 : 123 }
      assert(colonIndex === 1);
      const colonRange = rangeBuffer[1];
      const key = itemBufferWithoutComma[0] as ContentNode;
      const value = itemBufferWithoutComma[2] as ContentNode;
      return createFlowMappingItem(
        context.transformRange({
          start: key.position.start.offset,
          end: value.position.end.offset,
        }),
        createMappingKey(key.position, key),
        createMappingValue(
          context.transformRange({
            start: colonRange.start,
            end: value.position.end.offset,
          }),
          value,
        ),
      );
    } else {
      assert(questionIndex === 0);
      if (colonIndex === 1) {
        // [ ? : 123 ] or { ? : 123 }
        const questionRange = rangeBuffer[0];
        const colonRange = rangeBuffer[1];
        const value = itemBufferWithoutComma[2] as ContentNode;
        return createFlowMappingItem(
          context.transformRange({
            start: questionRange.start,
            end: value.position.end.offset,
          }),
          createMappingKey(
            context.transformRange(questionRange),
            context.transformNode(null),
          ),
          createMappingValue(
            context.transformRange({
              start: colonRange.start,
              end: value.position.end.offset,
            }),
            value,
          ),
        );
      } else {
        // [ ? 123 : ] or { ? 123 : }
        const questionRange = rangeBuffer[0];
        const colonRange = rangeBuffer[2];
        const key = itemBufferWithoutComma[1] as ContentNode;
        return createFlowMappingItem(
          context.transformRange({
            start: questionRange.start,
            end: colonRange.end,
          }),
          createMappingKey(
            context.transformRange({
              start: questionRange.start,
              end: key.position.end.offset,
            }),
            key,
          ),
          createMappingValue(
            context.transformRange(colonRange),
            context.transformNode(null),
          ),
        );
      }
    }
  } else {
    // [ ? 123 : 123 ]
    assert(questionIndex === 0 && colonIndex === 2);

    const questionRange = rangeBuffer[0];
    const colonRange = rangeBuffer[2];
    const key = itemBufferWithoutComma[1] as ContentNode;
    const value = itemBufferWithoutComma[3] as ContentNode;

    return createFlowMappingItem(
      context.transformRange({
        start: questionRange.start,
        end: value.position.end.offset,
      }),
      createMappingKey(
        context.transformRange({
          start: questionRange.start,
          end: key.position.end.offset,
        }),
        key,
      ),
      createMappingValue(
        context.transformRange({
          start: colonRange.start,
          end: value.position.end.offset,
        }),
        value,
      ),
    );
  }
}
