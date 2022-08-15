const isEqual = <T>(objA: T, objB: T) => {
  if (Object.is(objA, objB)) return true;
  if (
    typeof objA !== 'object' ||
    typeof objB !== 'object' ||
    objA === null ||
    objB === null
  )
    return false;

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    const keyA = keysA[i];
    const valueA = objA[keyA as keyof T];
    const valueB = objB[keyA as keyof T];

    if (!Object.is(valueA, valueB)) return false;
  }
  return true;
};

export default isEqual;
