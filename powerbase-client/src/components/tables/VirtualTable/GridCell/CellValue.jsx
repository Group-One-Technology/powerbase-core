import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { ArrowsExpandIcon } from '@heroicons/react/outline';

import { FieldType } from '@lib/constants/field-types';
import { formatDate } from '@lib/helpers/formatDate';
import { formatCurrency } from '@lib/helpers/formatCurrency';
import { isValidHttpUrl } from '@lib/helpers/isValidHttpUrl';
import { isValidEmail } from '@lib/helpers/isValidEmail';

export function CellValue({
  value,
  isLoaded,
  isRowNo,
  isHoveredRow,
  isLastRow,
  field,
  fieldType,
  handleExpandRecord,
  handleChange,
}) {
  const className = value?.toString().length && field?.isForeignKey
    ? 'px-2 py-0.25 bg-blue-50 rounded'
    : '';

  if (!isLastRow && !isLoaded) {
    return <span className="h-5 bg-gray-200 rounded w-full animate-pulse" />;
  }

  if (isRowNo || !field) {
    return (
      <>
        <span className="flex-1 mr-4 text-right truncate">
          {value?.toString()}
        </span>
        <span className="flex-1">
          {isHoveredRow && !isLastRow && (
            <button
              type="button"
              className="inline-flex items-center p-0.5 border border-transparent rounded-full text-indigo-600 hover:bg-indigo-100 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-indigo-100"
              onClick={() => {
                if (handleExpandRecord) {
                  handleExpandRecord(value);
                }
              }}
            >
              <ArrowsExpandIcon className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Expand Record</span>
            </button>
          )}{' '}
        </span>
      </>
    );
  }

  if (field.isPii) {
    return <span>*****</span>;
  }

  if (fieldType?.name === FieldType.CHECKBOX && !field.isPii) {
    return (
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        checked={value?.toString() === 'true'}
        onChange={() => handleChange(!(value?.toString() === 'true'))}
      />
    );
  }

  if (fieldType?.name === FieldType.DATE && !field.isPii) {
    const date = formatDate(value);

    return <span className={className}>{date ? `${date} UTC` : null}</span>;
  }

  if (fieldType?.name === FieldType.JSON_TEXT) {
    return <span className={className}>{value?.toString().length > 0 ? '{ ... }' : '{}'}</span>;
  }

  if (fieldType?.name === FieldType.EMAIL && isValidEmail(value)) {
    return (
      <a
        href={`mailto:${value.toString()}`}
        className={cn('underline text-gray-500', className)}
      >
        {value.toString()}
      </a>
    );
  }

  if (fieldType?.name === FieldType.URL && isValidHttpUrl(value)) {
    return (
      <a
        href={value.toString()}
        target="_blank"
        rel="noreferrer"
        className={cn('underline text-gray-500', className)}
      >
        {value.toString()}
      </a>
    );
  }

  if (fieldType?.name === FieldType.CURRENCY) {
    const currency = formatCurrency(value, field?.options);

    return <span className={className}>{currency}</span>;
  }

  if (fieldType?.name === FieldType.NUMBER && value != null) {
    return <span className={className}>{Number(value)}</span>;
  }

  return (
    <span
      className={cn(
        value?.toString().length
          && field.isForeignKey
          && 'px-2 py-0.25 bg-blue-50 rounded',
      )}
    >
      {value?.toString()}
      {fieldType?.name === FieldType.PERCENT && '%'}
    </span>
  );
}

CellValue.propTypes = {
  value: PropTypes.any,
  isLoaded: PropTypes.bool.isRequired,
  isRowNo: PropTypes.bool.isRequired,
  isHoveredRow: PropTypes.bool.isRequired,
  isLastRow: PropTypes.bool.isRequired,
  field: PropTypes.object,
  fieldType: PropTypes.object,
  handleExpandRecord: PropTypes.func,
  handleChange: PropTypes.func.isRequired,
};
