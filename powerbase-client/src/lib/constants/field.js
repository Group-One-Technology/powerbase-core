import { FieldType } from './field-types';

export const FIELDS_SCREEN = {
  Fields: 'fields',
  AddField: 'add_field',
};

export const COLUMN_TYPE = [
  {
    nameId: 'persistent_field',
    descriptionId: 'persistent_field_description',
    name: 'Persistent Field',
    description: 'Creates a new column in your SQL table.',
  },
  {
    nameId: 'magic_field',
    descriptionId: 'magic_field_description',
    name: 'Magic Field',
    description: 'Accessible through powerbase but will not affect your current database.',
  },
];

const TEXT_DATA_TYPES = ['string', 'char'];
const NUMBER_DATA_TYPES = ['integer', 'float', 'numeric', 'big decimal', 'big num'];

export const COLUMN_DATA_TYPES = {
  [FieldType.CHECKBOX]: ['bool'],
  [FieldType.DATE]: ['date', 'datetime'],
  [FieldType.NUMBER]: NUMBER_DATA_TYPES,
  [FieldType.CURRENCY]: NUMBER_DATA_TYPES,
  [FieldType.PERCENT]: NUMBER_DATA_TYPES,
  [FieldType.SINGLE_LINE_TEXT]: TEXT_DATA_TYPES,
  [FieldType.EMAIL]: TEXT_DATA_TYPES,
  [FieldType.URL]: TEXT_DATA_TYPES,
  [FieldType.JSON_TEXT]: TEXT_DATA_TYPES,
  [FieldType.LONG_TEXT]: TEXT_DATA_TYPES,
  [FieldType.SINGLE_SELECT]: TEXT_DATA_TYPES,
  [FieldType.MULTIPLE_SELECT]: TEXT_DATA_TYPES,
  [FieldType.PLUGIN]: ['bool', 'date', 'datetime', ...TEXT_DATA_TYPES, ...NUMBER_DATA_TYPES],
  [FieldType.OTHERS]: ['bool', 'date', 'datetime', ...TEXT_DATA_TYPES, ...NUMBER_DATA_TYPES],
};
