/* eslint-disable  */
const isValidNumberOrDecimal = (value) => {
  const pattern = new RegExp(/^\d*\.?\d*$/);
  return pattern.test(value);
};