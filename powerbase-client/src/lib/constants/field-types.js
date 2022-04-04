export const FieldType = {
  NUMBER: 'Number',
  CHECKBOX: 'Checkbox',
  SINGLE_LINE_TEXT: 'Single Line Text',
  LONG_TEXT: 'Long Text',
  SINGLE_SELECT: 'Single Select',
  MULTIPLE_SELECT: 'Multiple Select',
  DATE: 'Date',
  EMAIL: 'Email',
  URL: 'URL',
  CURRENCY: 'Currency',
  PERCENT: 'Percent',
  JSON_TEXT: 'JSON Text',
  PLUGIN: 'Plugin',
  OTHERS: 'Others',
};

Object.freeze(FieldType);

export const NUMBER_TYPES = [FieldType.NUMBER, FieldType.CURRENCY, FieldType.PERCENT];
