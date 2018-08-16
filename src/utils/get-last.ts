export function getLast<T>(array: T[]) {
  return array[array.length - 1] as T | undefined;
}
