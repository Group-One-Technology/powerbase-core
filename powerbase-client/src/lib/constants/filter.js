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
  [FieldType.DATE]: TEXT_OPERATORS,
  [FieldType.EMAIL]: TEXT_OPERATORS,
  [FieldType.PLUGIN]: TEXT_OPERATORS,
  [FieldType.OTHERS]: TEXT_OPERATORS,
};
