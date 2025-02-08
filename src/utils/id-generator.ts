export const generateId = (
  prefix: String,
  charLength: number,
  current: number
): string => {
  const paddedNumber = String(current).padStart(
    charLength - prefix.length,
    "0"
  );
  return prefix + paddedNumber;
};

export default generateId;
