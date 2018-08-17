export function createUpdater<T, U>(
  host: T,
  getter: (x: T) => U,
  setter: (x: T, v: U) => void,
  shouldUpdate: (reduced: U, value: U) => boolean,
) {
  let reduced = getter(host);
  return (value: U) => {
    if (shouldUpdate(reduced, value)) {
      setter(host, (reduced = value));
    }
  };
}
