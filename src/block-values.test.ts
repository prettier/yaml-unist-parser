import * as YAML from "yaml";
import { parse } from "./parse.ts";
import { type BlockValue, type Mapping } from "./types.ts";

const blockStyles = ["|", ">", "|+", "|-", ">+", ">-"];
const trailingSpace = ["", "  ", "   ", "  \t"];
const newlines = ["", "\n", "\n\n", "\n\n\n"];

const snippets = blockStyles.flatMap(blockStyle =>
  trailingSpace.flatMap(space =>
    newlines.flatMap(lines => [
      `value: ${blockStyle}\n  x\n${space}${lines}`,
      `value: ${blockStyle}\n${space}${lines}`,
    ]),
  ),
);

const parseBlock = (code: string) => {
  const root = parse(code);
  const document = root.children[0];
  const mapping = document.children[1].children[0] as Mapping;
  const mappingItem = mapping.children[0];
  const mappingValue = mappingItem.children[1];
  const block = mappingValue.children[0] as BlockValue;
  return { document, block };
};

describe("Block values", () => {
  for (const code of snippets) {
    test(JSON.stringify(code), () => {
      const codeWithoutEndMark = code;
      const codeWithEndMark = `${code}\n...`;

      const result: Map<boolean, { value: string; block: BlockValue }> =
        new Map();

      for (const { code, documentEndMarker } of [
        { code: codeWithoutEndMark, documentEndMarker: false },
        { code: codeWithEndMark, documentEndMarker: true },
      ]) {
        const { document, block } = parseBlock(code);
        expect(document.documentEndMarker).toBe(documentEndMarker);
        expect(block.type).toBeOneOf(["blockLiteral", "blockFolded"]);
        const expectedValue: string = YAML.parse(code).value;
        expect(block.value).toBe(expectedValue);
        result.set(documentEndMarker, {
          value: expectedValue,
          block,
        });
      }

      const blockWithoutEndMark = result.get(false)!.block;
      const blockWithEndMark = result.get(true)!.block;
      const { chomping } = blockWithoutEndMark;

      // I don't know what the value should be
      if (chomping === "keep") {
        return;
      }

      expect(blockWithoutEndMark.value).toBe(blockWithEndMark.value);
    });
  }
});
