export const formatToDecimalPlaces = (num, precision) => {
  const formatted = num?.toFixed(precision);
  return formatted;
};
