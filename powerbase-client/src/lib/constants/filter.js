import { FieldType } from './field-types';

const GENERAL_OPERATORS = ['is', 'is not'];
const TEXT_OPERATORS = [
  ...GENERAL_OPERATORS,
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
  [FieldType.CHECKBOX]: GENERAL_OPERATORS,
  [FieldType.SINGLE_SELECT]: GENERAL_OPERATORS,
  [FieldType.MULTIPLE_SELECT]: TEXT_OPERATORS,
  [FieldType.DATE]: [
    'is exact date',
    'is not exact date',
    'is before',
    'is after',
    'is on or before',
    'is on or after',
  ],
  [FieldType.EMAIL]: TEXT_OPERATORS,
  [FieldType.PLUGIN]: TEXT_OPERATORS,
  [FieldType.OTHERS]: TEXT_OPERATORS,
};
