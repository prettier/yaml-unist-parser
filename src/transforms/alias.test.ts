import { getFirstContent, testCases, testSyntaxError } from "../helpers";

testCases([["  *123  ", getFirstContent()]]);
testSyntaxError("  !!tag &anchor *123  ");
