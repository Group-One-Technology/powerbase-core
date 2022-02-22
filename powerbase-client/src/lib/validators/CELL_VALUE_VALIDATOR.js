import { FieldType } from '@lib/constants/field-types';
import { isValidDate } from '@lib/helpers/isValidDate';
import { isValidEmail } from '@lib/helpers/isValidEmail';
import { isValidHttpUrl } from '@lib/helpers/isValidHttpUrl';
import { isValidJSONString } from '@lib/helpers/isValidJSONString';
import { isValidNumber } from '@lib/helpers/isValidNumber';

/**
 * Validates an email input.
 *
 * @param {string} value The email that has been inputted by the user.
 * @returns boolean - check whether the input is valid or not.
 */
export function CELL_VALUE_VALIDATOR(value, type = FieldType.SINGLE_LINE_TEXT, isRequired = false) {
  if (isRequired && !value) {
    throw new Error('Required');
  }

  switch (type) {
    case FieldType.EMAIL: {
      if (!isValidEmail(value)) throw new Error('Must be a valid email.');
      break;
    }
    case FieldType.URL: {
      if (!isValidHttpUrl(value)) throw new Error('Must be a valid url.');
      break;
    }
    case FieldType.DATE: {
      if (!isValidDate(value)) throw new Error('Must be a valid date.');
      break;
    }
    case FieldType.JSON_TEXT: {
      if (!isValidJSONString(value)) throw new Error('Must be a valid JSON text.');
      break;
    }
    case FieldType.CURRENCY:
    case FieldType.PERCENT:
    case FieldType.NUMBER: {
      if (!isValidNumber(value)) throw new Error('Must be a valid number.');
      break;
    }
    default: {
      return true;
    }
  }

  return true;
}
