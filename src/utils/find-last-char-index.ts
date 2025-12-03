export function findLastCharIndex(text: string, from: number, regex: RegExp) {
  for (let i = from; i >= 0; i--) {
    if (regex.test(text[i])) {
      return i;
    }
  }
  // istanbul ignore next -- @preserve
  return -1;
}
