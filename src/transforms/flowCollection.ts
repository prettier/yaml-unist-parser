import assert = require("assert");
import { Context } from "../transform";
import {
  ContentNode,
  FlowCollection,
  FlowMappingItem,
  FlowSequenceItem,
  MappingKey,
  MappingValue,
  Position,
} from "../types";
import {
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
): FlowMappingItem | FlowSequenceItem {
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
          context.transformNode(null),
          context.transformNode(null),
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
      return createMappingItem(
        item === "?"
          ? createMappingKey(
              context.transformNode(null),
              context.transformRange(range),
            )
          : context.transformNode(null),
        item === ":"
          ? createMappingValue(
              context.transformNode(null),
              context.transformRange(range),
            )
          : context.transformNode(null),
        position,
      );
    } else {
      // [ 123 ] or { 123 }
      return type === "FLOW_MAP"
        ? createMappingItem(
            createMappingKey(item, item.position),
            context.transformNode(null),
            item.position,
          )
        : createSequenceItem(item, item.position);
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
        end: key.position.end,
      };
      return createMappingItem(
        createMappingKey(key, keyPosition),
        context.transformNode(null),
        keyPosition,
      );
    } else if (colonIndex === 0) {
      // [ : 123 ] or { : 123 }
      const colonRange = rangeBuffer[0];
      const value = itemBufferWithoutComma[1] as ContentNode;
      const valuePosition = {
        start: context.transformOffset(colonRange.start),
        end: value.position.end,
      };
      return createMappingItem(
        context.transformNode(null),
        createMappingValue(value, valuePosition),
        valuePosition,
      );
    } else {
      // [ 123 : ] or { 123 : }
      assert(colonIndex === 1);
      const colonRange = rangeBuffer[1];
      const key = itemBufferWithoutComma[0] as ContentNode;
      return createMappingItem(
        createMappingKey(key, key.position),
        createMappingValue(
          context.transformNode(null),
          context.transformRange(colonRange),
        ),
        {
          start: key.position.start,
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
        createMappingKey(key, key.position),
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
  key: FlowMappingItem["children"][0],
  value: FlowMappingItem["children"][1],
  position: Position,
): FlowMappingItem {
  return {
    type: "flowMappingItem",
    children: [key, value],
    position,
    ...createCommentAttachableNode(),
  };
}

function createSequenceItem(
  node: FlowSequenceItem["children"][0],
  position: Position,
): FlowSequenceItem {
  return {
    type: "flowSequenceItem",
    children: [node],
    position,
  };
}
