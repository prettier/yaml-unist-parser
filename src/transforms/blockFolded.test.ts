import { getFirstContent, testCases } from "../helpers";

testCases([
  [">\n  123\n  456\n\n\n", getFirstContent()],
  [">+\n  123\n  456\n\n\n", getFirstContent()],
  [">-\n  123\n  456\n\n\n", getFirstContent()],
  [">1\n  123\n  456\n\n\n", getFirstContent()],
  [">1+\n  123\n  456\n\n\n", getFirstContent()],
  [">1-\n  123\n  456\n\n\n", getFirstContent()],
]);
