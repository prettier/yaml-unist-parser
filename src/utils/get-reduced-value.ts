export function getReducedValue<T>(
  array: T[],
  getter: (x: T) => number,
  shouldUpdate: (reduced: number, current: number) => boolean,
): T | undefined {
  // istanbul ignore next
  if (array.length === 0) {
    return undefined;
  }

  let reducedValue = array[0];
  let reducedNumber = getter(array[0]);

  for (let i = 1; i < array.length; i++) {
    const currentValue = array[i];
    const currentNumber = getter(currentValue);

    if (shouldUpdate(reducedNumber, currentNumber)) {
      reducedValue = currentValue;
      reducedNumber = currentNumber;
    }
  }

  return reducedValue;
}
