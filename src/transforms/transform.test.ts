import { testSyntaxError } from "../helpers.js";

testSyntaxError("a: - 123", "throw if node.error is not null");
