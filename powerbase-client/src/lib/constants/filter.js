import { FieldType } from './field-types';

export const NULL_OPERATORS = ['is empty', 'is not empty'];
export const EXACT_OPERATORS = ['is', 'is not'];
export const TEXT_OPERATORS = [
  ...EXACT_OPERATORS,
  ...NULL_OPERATORS,
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
    ...NULL_OPERATORS,
  ],
  [FieldType.CHECKBOX]: EXACT_OPERATORS,
  [FieldType.SINGLE_SELECT]: EXACT_OPERATORS,
  [FieldType.MULTIPLE_SELECT]: TEXT_OPERATORS,
  [FieldType.DATE]: [
    'is exact date',
    'is not exact date',
    'is before',
    'is after',
    'is on or before',
    'is on or after',
    ...NULL_OPERATORS,
  ],
  [FieldType.EMAIL]: TEXT_OPERATORS,
  [FieldType.PLUGIN]: TEXT_OPERATORS,
  [FieldType.OTHERS]: TEXT_OPERATORS,
};
