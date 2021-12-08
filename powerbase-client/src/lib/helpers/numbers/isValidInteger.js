export const isValidInteger = (value) => {
  const pattern = new RegExp(/^[0-9]*$/);
  return pattern.test(value);
};
