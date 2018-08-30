export function createSlicer<T>(array: T[], start: number) {
  let index = start;
  return (end: number) => array.slice(index, (index = end));
}
