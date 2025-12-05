import yamlTestSuite from "yaml-test-suite";
import { parse } from "../../src/parse.ts";

const bugs = new Set([
  // The test suite expects a parsing error,
  // but the yaml package does not give a parsing error.
  // https://github.com/eemeli/yaml/blob/086fa6b5bae325da18734750cddee231ce578930/tests/yaml-test-suite.ts#L19
  "2JQS.yaml",
  "SF5V.yaml",
]);

for (const { id, cases, name } of yamlTestSuite) {
  for (const [index, testCase] of cases.entries()) {
    const fileBasename = `${id}${index === 0 ? "" : `-${index + 1}`}`;
    const filename = `${fileBasename}.yaml`;

    (bugs.has(filename) ? test.skip : test)(
      `${filename}: ${"name" in testCase ? (testCase.name ?? name) : name}`,
      async () => {
        const input = testCase.yaml;

        if ("fail" in testCase && testCase.fail) {
          expect(() => parse(input)).toThrowErrorMatchingSnapshot();
        } else {
          await expect({ input, ast: parse(input) }).toMatchFileSnapshot(
            `ast-snapshots/${fileBasename}.snapshot.yaml`,
          );
        }
      },
    );
  }
}
