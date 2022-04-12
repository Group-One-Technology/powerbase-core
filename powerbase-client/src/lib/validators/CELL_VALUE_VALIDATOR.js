/* eslint-disable default-case */
import { FieldType } from '@lib/constants/field-types';
import { isValidDate } from '@lib/helpers/isValidDate';
import { isValidEmail } from '@lib/helpers/isValidEmail';
import { isValidHttpUrl } from '@lib/helpers/isValidHttpUrl';
import { isValidJSONString } from '@lib/helpers/isValidJSONString';
import { isValidNumber } from '@lib/helpers/isValidNumber';

/**
 * Validates an cell input.
 * @returns boolean - check whether the input is valid or not.
 */
export function CELL_VALUE_VALIDATOR({
  name,
  value,
  type = FieldType.SINGLE_LINE_TEXT,
  required = false,
  strict = false,
}) {
  const isEmpty = (value == null || (typeof value === 'string' && value.length === 0));

  if (required && isEmpty) {
    throw new Error(`${name} is Required`);
  } else if (isEmpty) return true;

  if (strict) {
    switch (type) {
      case FieldType.EMAIL: {
        if (!isValidEmail(value)) throw new Error(`${name} must be a valid email.`);
        break;
      }
      case FieldType.URL: {
        if (!isValidHttpUrl(value)) throw new Error(`${name} must be a valid url.`);
        break;
      }
      case FieldType.JSON_TEXT: {
        if (!isValidJSONString(value)) throw new Error(`${name} must be a JSON text.`);
        break;
      }
    }
  }

  switch (type) {
    case FieldType.DATE: {
      if (!isValidDate(new Date(value))) throw new Error(`${name} must be a valid date.`);
      break;
    }
    case FieldType.CURRENCY:
    case FieldType.PERCENT:
    case FieldType.NUMBER: {
      if (!isValidNumber(value)) throw new Error(`${name} must be a valid number.`);
      break;
    }
  }

  return true;
}
