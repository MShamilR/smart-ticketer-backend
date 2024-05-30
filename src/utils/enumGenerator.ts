const createEnumObject = <T extends readonly [string, ...string[]]>(
  values: T
): Record<T[number], T[number]> => {
  const obj: Record<string, T[number]> = {};
  for (const value of values) {
    obj[value.toLocaleUpperCase()] = value;
  }
  return obj;
};

export default createEnumObject;
