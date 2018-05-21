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
import { cloneObject, getLast } from "../utils";
import { transformOffset } from "./offset";
import { transformRange } from "./range";

type ItemBuffer = Array<"," | "?" | ":" | ContentNode>;
type RangeBuffer = Array<{ start: number; end: number }>;

export function transformFlowCollection(
  flowCollection: yaml.FlowCollection,
  context: Context,
): FlowCollection {
  assert(flowCollection.valueRange !== null);

  // at least open marker and close marker
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
      if (item === ":") {
        assert(!hasColon);
        hasColon = true;
      } else if (item === "?") {
        assert(!hasColon);
        assert(!hasQuestion);
        hasQuestion = true;
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
    position: transformRange(flowCollection.valueRange!, context),
    leadingComments: [],
    middleComments: [],
    trailingComments: [],
  };

  function pushBuffer(item: ItemBuffer[number]) {
    if (typeof item === "string") {
      lastItemStartOffset = context.text.indexOf(item, lastItemEndOffset);
      lastItemEndOffset = lastItemStartOffset + item.length;
    } else {
      lastItemStartOffset = item.position.start.offset;
      lastItemEndOffset = item.position.end.offset;
    }

    assert(lastItemStartOffset !== -1 && lastItemEndOffset !== -1);

    itemBuffer.push(item);
    rangeBuffer.push({
      start: lastItemStartOffset,
      end: lastItemEndOffset,
    });
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
    const beforeCommaPosition = transformRange(rangeBuffer[0].start, context);
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
      const position = transformRange(range, context);

      const keyPosition = transformRange(
        item === "?" ? range : range.start,
        context,
      );
      const valuePosition = transformRange(
        item === ":" ? range : range.end,
        context,
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
              transformRange(item.position.end.offset, context),
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
          transformRange(questionRange, context),
        ),
        createMappingValue(
          context.transformNode(null),
          transformRange(colonRange, context),
        ),
        transformRange(
          {
            start: questionRange.start,
            end: colonRange.end,
          },
          context,
        ),
      );
    } else if (questionIndex !== -1) {
      // [ ? 123 ] or { ? 123 }
      assert(questionIndex === 0);
      const questionRange = rangeBuffer[0];
      const key = itemBufferWithoutComma[1] as ContentNode;
      const keyPosition = {
        start: transformOffset(questionRange.start, context),
        end: cloneObject(key.position.end),
      };
      return createMappingItem(
        createMappingKey(key, keyPosition),
        createMappingValue(
          context.transformNode(null),
          transformRange(key.position.end.offset, context),
        ),
        cloneObject(keyPosition),
      );
    } else if (colonIndex === 0) {
      // [ : 123 ] or { : 123 }
      const colonRange = rangeBuffer[0];
      const value = itemBufferWithoutComma[1] as ContentNode;
      const valuePosition = {
        start: transformOffset(colonRange.start, context),
        end: cloneObject(value.position.end),
      };
      return createMappingItem(
        createMappingKey(
          context.transformNode(null),
          transformRange(colonRange.start, context),
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
          transformRange(colonRange, context),
        ),
        {
          start: cloneObject(key.position.start),
          end: transformOffset(colonRange.end, context),
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
          transformRange(
            {
              start: colonRange.start,
              end: value.position.end.offset,
            },
            context,
          ),
        ),
        transformRange(
          {
            start: key.position.start.offset,
            end: value.position.end.offset,
          },
          context,
        ),
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
            transformRange(questionRange, context),
          ),
          createMappingValue(
            value,
            transformRange(
              { start: colonRange.start, end: value.position.end.offset },
              context,
            ),
          ),
          transformRange(
            { start: questionRange.start, end: value.position.end.offset },
            context,
          ),
        );
      } else {
        // [ ? 123 : ] or { ? 123 : }
        const questionRange = rangeBuffer[0];
        const colonRange = rangeBuffer[2];
        const key = itemBufferWithoutComma[1] as ContentNode;
        return createMappingItem(
          createMappingKey(
            key,
            transformRange(
              { start: questionRange.start, end: key.position.end.offset },
              context,
            ),
          ),
          createMappingValue(
            context.transformNode(null),
            transformRange(colonRange, context),
          ),
          transformRange(
            { start: questionRange.start, end: colonRange.end },
            context,
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

    return createMappingItem(
      createMappingKey(
        key,
        transformRange(
          { start: questionRange.start, end: key.position.end.offset },
          context,
        ),
      ),
      createMappingValue(
        value,
        transformRange(
          { start: colonRange.start, end: value.position.end.offset },
          context,
        ),
      ),
      transformRange(
        { start: questionRange.start, end: value.position.end.offset },
        context,
      ),
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
    leadingComments: [],
    middleComments: [],
    trailingComments: [],
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
    leadingComments: [],
    middleComments: [],
    trailingComments: [],
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
    leadingComments: [],
    middleComments: [],
    trailingComments: [],
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
    leadingComments: [],
    middleComments: [],
    trailingComments: [],
  };
}
