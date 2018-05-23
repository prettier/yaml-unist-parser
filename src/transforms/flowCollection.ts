import assert = require("assert");
import { Context } from "../transform";
import {
  ContentNode,
  FlowCollection,
  MappingItem,
  MappingKey,
  MappingValue,
  Position,
  SequenceItem,
} from "../types";
import {
  cloneObject,
  createCommentAttachableNode,
  createContentNode,
  getLast,
} from "../utils";

type ItemBuffer = Array<"," | "?" | ":" | ContentNode>;
type RangeBuffer = Array<{ start: number; end: number }>;

export function transformFlowCollection(
  flowCollection: yaml.FlowCollection,
  context: Context,
): FlowCollection {
  assert(flowCollection.valueRange !== null);

  context.assertSyntaxError(
    flowCollection.items.length >= 2,
    "Missing flow collection close marker",
    () => context.transformRange(flowCollection.valueRange!.end - 1),
  );

  context.assertSyntaxError(
    flowCollection.type === "FLOW_MAP"
      ? flowCollection.items[0] === "{" &&
        getLast(flowCollection.items)! === "}"
      : flowCollection.items[0] === "[" &&
        getLast(flowCollection.items)! === "]",
    "Unpaired flow collection close marker",
    () => context.transformRange(flowCollection.valueRange!.end - 1),
  );

  let hasColon = false;
  let hasQuestion = false;

  const children: Array<SequenceItem | MappingItem> = [];

  let itemBuffer: ItemBuffer = [];
  let rangeBuffer: RangeBuffer = [];

  let lastItemStartOffset = flowCollection.valueRange!.start; // start marker
  let lastItemEndOffset = lastItemStartOffset + 1;

  const lastIndex = flowCollection.items.length - 2;
  for (let i = 1; i <= lastIndex; i++) {
    const item = flowCollection.items[i];

    // istanbul ignore if
    if (item === "{" || item === "}" || item === "[" || item === "]") {
      assert(true);
      continue; // convince control flow analysis
    } else if (typeof item === "object" && item.type === "COMMENT") {
      const comment = context.transformNode(item);
      context.comments.push(comment);
      lastItemStartOffset = comment.position.start.offset;
      lastItemEndOffset = comment.position.end.offset;
    } else {
      if (item === "?") {
        context.assertSyntaxError(
          !hasColon,
          "Key marker is not allowed to be behind value marker in the same group",
          () => context.transformRange(getItemRange(item)),
        );
        context.assertSyntaxError(
          !hasQuestion,
          "Key marker is not allowed to be appeared more than once in the same group",
          () => context.transformRange(getItemRange(item)),
        );
        hasQuestion = true;
      } else if (item === ":") {
        context.assertSyntaxError(
          !hasColon,
          "Value marker is not allowed to be appeared more than once in the same group",
          () => context.transformRange(getItemRange(item)),
        );
        hasColon = true;
      }
      pushBuffer(typeof item === "string" ? item : context.transformNode(item));
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

  return {
    type: "flowCollection",
    children,
    position: context.transformRange(flowCollection.valueRange!),
    ...createCommentAttachableNode(),
    ...createContentNode(),
  };

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
): MappingItem | SequenceItem {
  assert(itemBuffer.length === rangeBuffer.length);

  const commaIndex = itemBuffer.indexOf(",");
  assert(commaIndex === -1 || commaIndex === itemBuffer.length - 1);

  const itemBufferWithoutComma = (commaIndex === -1
    ? itemBuffer
    : itemBuffer.slice(0, -1)) as Array<
    Exclude<(typeof itemBuffer)[number], ",">
  >;

  assert(itemBufferWithoutComma.length <= 4);

  if (itemBufferWithoutComma.length === 0) {
    // [ , ] or { , }
    assert(itemBuffer.length === 1);
    const beforeCommaPosition = context.transformRange(rangeBuffer[0].start);
    return type === "FLOW_MAP"
      ? createMappingItem(
          createMappingKey(
            context.transformNode(null),
            cloneObject(beforeCommaPosition),
          ),
          createMappingValue(
            context.transformNode(null),
            cloneObject(beforeCommaPosition),
          ),
          beforeCommaPosition,
        )
      : createSequenceItem(context.transformNode(null), beforeCommaPosition);
  } else if (itemBufferWithoutComma.length === 1) {
    const item = itemBufferWithoutComma[0];
    if (typeof item === "string") {
      // [ ? ] or [ : ]
      // { ? } or { : }
      const range = rangeBuffer[0];
      const position = context.transformRange(range);

      const keyPosition = context.transformRange(
        item === "?" ? range : range.start,
      );
      const valuePosition = context.transformRange(
        item === ":" ? range : range.end,
      );
      return createMappingItem(
        createMappingKey(context.transformNode(null), keyPosition),
        createMappingValue(context.transformNode(null), valuePosition),
        position,
      );
    } else {
      // [ 123 ] or { 123 }
      return type === "FLOW_MAP"
        ? createMappingItem(
            createMappingKey(item, cloneObject(item.position)),
            createMappingValue(
              context.transformNode(null),
              context.transformRange(item.position.end.offset),
            ),
            cloneObject(item.position),
          )
        : createSequenceItem(item, cloneObject(item.position));
    }
  }

  const colonIndex = itemBuffer.indexOf(":");
  const questionIndex = itemBuffer.indexOf("?");

  if (itemBufferWithoutComma.length === 2) {
    if (questionIndex !== -1 && colonIndex !== -1) {
      // [ ? : ] or { ? : }
      const questionRange = rangeBuffer[0];
      const colonRange = rangeBuffer[1];
      return createMappingItem(
        createMappingKey(
          context.transformNode(null),
          context.transformRange(questionRange),
        ),
        createMappingValue(
          context.transformNode(null),
          context.transformRange(colonRange),
        ),
        context.transformRange({
          start: questionRange.start,
          end: colonRange.end,
        }),
      );
    } else if (questionIndex !== -1) {
      // [ ? 123 ] or { ? 123 }
      assert(questionIndex === 0);
      const questionRange = rangeBuffer[0];
      const key = itemBufferWithoutComma[1] as ContentNode;
      const keyPosition = {
        start: context.transformOffset(questionRange.start),
        end: cloneObject(key.position.end),
      };
      return createMappingItem(
        createMappingKey(key, keyPosition),
        createMappingValue(
          context.transformNode(null),
          context.transformRange(key.position.end.offset),
        ),
        cloneObject(keyPosition),
      );
    } else if (colonIndex === 0) {
      // [ : 123 ] or { : 123 }
      const colonRange = rangeBuffer[0];
      const value = itemBufferWithoutComma[1] as ContentNode;
      const valuePosition = {
        start: context.transformOffset(colonRange.start),
        end: cloneObject(value.position.end),
      };
      return createMappingItem(
        createMappingKey(
          context.transformNode(null),
          context.transformRange(colonRange.start),
        ),
        createMappingValue(value, valuePosition),
        cloneObject(valuePosition),
      );
    } else {
      // [ 123 : ] or { 123 : }
      assert(colonIndex === 1);
      const colonRange = rangeBuffer[1];
      const key = itemBufferWithoutComma[0] as ContentNode;
      return createMappingItem(
        createMappingKey(key, cloneObject(key.position)),
        createMappingValue(
          context.transformNode(null),
          context.transformRange(colonRange),
        ),
        {
          start: cloneObject(key.position.start),
          end: context.transformOffset(colonRange.end),
        },
      );
    }
  } else if (itemBufferWithoutComma.length === 3) {
    if (questionIndex === -1) {
      // [ 123 : 123 ] or { 123 : 123 }
      assert(colonIndex === 1);
      const colonRange = rangeBuffer[1];
      const key = itemBufferWithoutComma[0] as ContentNode;
      const value = itemBufferWithoutComma[2] as ContentNode;
      return createMappingItem(
        createMappingKey(key, cloneObject(key.position)),
        createMappingValue(
          value,
          context.transformRange({
            start: colonRange.start,
            end: value.position.end.offset,
          }),
        ),
        context.transformRange({
          start: key.position.start.offset,
          end: value.position.end.offset,
        }),
      );
    } else {
      assert(questionIndex === 0);
      if (colonIndex === 1) {
        // [ ? : 123 ] or { ? : 123 }
        const questionRange = rangeBuffer[0];
        const colonRange = rangeBuffer[1];
        const value = itemBufferWithoutComma[2] as ContentNode;
        return createMappingItem(
          createMappingKey(
            context.transformNode(null),
            context.transformRange(questionRange),
          ),
          createMappingValue(
            value,
            context.transformRange({
              start: colonRange.start,
              end: value.position.end.offset,
            }),
          ),
          context.transformRange({
            start: questionRange.start,
            end: value.position.end.offset,
          }),
        );
      } else {
        // [ ? 123 : ] or { ? 123 : }
        const questionRange = rangeBuffer[0];
        const colonRange = rangeBuffer[2];
        const key = itemBufferWithoutComma[1] as ContentNode;
        return createMappingItem(
          createMappingKey(
            key,
            context.transformRange({
              start: questionRange.start,
              end: key.position.end.offset,
            }),
          ),
          createMappingValue(
            context.transformNode(null),
            context.transformRange(colonRange),
          ),
          context.transformRange({
            start: questionRange.start,
            end: colonRange.end,
          }),
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

    return createMappingItem(
      createMappingKey(
        key,
        context.transformRange({
          start: questionRange.start,
          end: key.position.end.offset,
        }),
      ),
      createMappingValue(
        value,
        context.transformRange({
          start: colonRange.start,
          end: value.position.end.offset,
        }),
      ),
      context.transformRange({
        start: questionRange.start,
        end: value.position.end.offset,
      }),
    );
  }
}

function createMappingKey(
  node: MappingKey["children"][0],
  position: Position,
): MappingKey {
  return {
    type: "mappingKey",
    children: [node],
    position,
    ...createCommentAttachableNode(),
  };
}

function createMappingValue(
  node: MappingValue["children"][0],
  position: Position,
): MappingValue {
  return {
    type: "mappingValue",
    children: [node],
    position,
    ...createCommentAttachableNode(),
  };
}

function createMappingItem(
  key: MappingKey,
  value: MappingValue,
  position: Position,
): MappingItem {
  return {
    type: "mappingItem",
    children: [key, value],
    position,
    ...createCommentAttachableNode(),
  };
}

function createSequenceItem(
  node: SequenceItem["children"][0],
  position: Position,
): SequenceItem {
  return {
    type: "sequenceItem",
    children: [node],
    position,
    ...createCommentAttachableNode(),
  };
}
