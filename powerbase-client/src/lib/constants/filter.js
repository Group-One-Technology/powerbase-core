import { FieldType } from './field-types';

const TEXT_OPERATORS = [
  'is',
  'is not',
  'contains',
  'does not contain',
];

export const OPERATOR = {
  [FieldType.SINGLE_LINE_TEXT]: TEXT_OPERATORS,
  [FieldType.LONG_TEXT]: TEXT_OPERATORS,
  [FieldType.NUMBER]: [
    '=',
    '!=',
    '>',
    '>=',
    '<',
    '<=',
  ],
  [FieldType.CHECKBOX]: ['is', 'is not'],
};
