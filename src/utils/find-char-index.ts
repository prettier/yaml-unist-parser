export function findCharIndex(text: string, from: number, regex: RegExp) {
  for (let i = from; i < text.length; i++) {
    if (regex.test(text[i])) {
      return i;
    }
  }
  return null;
}
