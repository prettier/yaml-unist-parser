export function clone<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }

  // istanbul ignore next
  if (Array.isArray(value)) {
    // @ts-ignore
    return value.map(clone);
  }

  const clonedObject: Partial<T> = {};
  for (const key of Object.keys(value) as Array<keyof T>) {
    clonedObject[key] = clone(value[key]);
  }
  return clonedObject as T;
}
