import { testSyntaxError } from "../helpers.ts";

testSyntaxError("a: - 123", "throw if node.error is not null");
