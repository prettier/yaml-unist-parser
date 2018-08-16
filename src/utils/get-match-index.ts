export function getMatchIndex(text: string, regex: RegExp): number {
  const match = text.match(regex);
  return match ? match.index! : -1;
}
