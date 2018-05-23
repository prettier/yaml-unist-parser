import { getFirstContent, testCases } from "../helpers";

testCases([["  *123  ", getFirstContent()]]);
testCases([["  !!tag &anchor *123  ", getFirstContent()]]);
