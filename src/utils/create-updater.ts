export function createUpdater<T>(
  origin: T,
  shouldUpdate: (reduced: T, value: T) => boolean,
) {
  let reduced = origin;
  let updated = false;
  return {
    get: () => reduced,
    hasUpdated: () => updated,
    update(value: T) {
      if (shouldUpdate(reduced, value)) {
        updated = true;
        reduced = value;
      }
    },
  };
}
