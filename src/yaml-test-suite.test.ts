import yamlTestSuite from "yaml-test-suite";
import { parse } from "./parse.js";

const bugs = new Set([
  "2JQS.yaml",
  "2G84.yaml",
  "2G84-2.yaml",
  "DK95.yaml",
  "G5U8.yaml",
  "H7TQ.yaml",
  "MUS6.yaml",
  "MUS6-2.yaml",
  "U99R.yaml",
  "Y79Y.yaml",
  "Y79Y-3.yaml",
  "Y79Y-5.yaml",
  "Y79Y-6.yaml",
  "Y79Y-7.yaml",
  "Y79Y-8.yaml",
  "Y79Y-9.yaml",
  "Y79Y-10.yaml",
  "YJV2.yaml",

  // The test suite expects a parsing error,
  // but the yaml package does not give a parsing error.
  // https://github.com/eemeli/yaml/blob/086fa6b5bae325da18734750cddee231ce578930/tests/yaml-test-suite.ts#L19
  "9MMA.yaml",
  "SF5V.yaml",
]);

for (const { id, cases, name } of yamlTestSuite) {
  for (const [index, testCase] of cases.entries()) {
    const filename = `${id}${index === 0 ? "" : `-${index + 1}`}.yaml`;

    (bugs.has(filename) ? test.skip : test)(
      `${filename}: ${"name" in testCase ? (testCase.name ?? name) : name}`,
      () => {
        if ("fail" in testCase && testCase.fail) {
          expect(() => parse(testCase.yaml)).toThrowErrorMatchingSnapshot();
        } else {
          expect(parse(testCase.yaml)).toMatchSnapshot();
        }
      },
    );
  }
}
