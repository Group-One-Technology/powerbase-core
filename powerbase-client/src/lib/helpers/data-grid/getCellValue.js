import { GridCellKind } from '@glideapps/glide-data-grid';
import { FieldType } from '@lib/constants/field-types';
import { formatDate } from '@lib/helpers/formatDate';
import { formatCurrency } from '@lib/helpers/formatCurrency';

/**
 * Gets formatted value for <DataEditor />
 * Used for @glideapps/glide-data-grid
 *
 * Usage:
 * const getContent = React.useCallback((cell) => {
 *  ...
 *  return {
 *    kind: GridCellKind.Text,
 *    allowOverlay: false,
 *    ...getCellValue(column, data)
 *  };
 * }, [])
 * ...
 * return <DataEditor getContent={getContent} ... />
 * */
export function getCellValue(column, value = '') {
  let data = value;
  let displayData = value;

  if (column.kind === GridCellKind.Bubble) {
    data = [value.toString()];
    displayData = Array.isArray(value)
      ? value.join(', ')
      : value.toString();
  } else if (column.fieldType.name === FieldType.PERCENT) {
    displayData = `${value}%`;
  } else if (column.fieldType.name === FieldType.CURRENCY && column.field) {
    const currency = formatCurrency(value, column.field.options);
    displayData = currency;
  } else if (column.kind === GridCellKind.Boolean) {
    data = data.toString() === 'true';
  } else if (column.fieldType.name === FieldType.DATE) {
    const date = formatDate(value);
    displayData = date;
  } else {
    data = value != null ? value.toString() : value;
    displayData = value?.toString() ?? '';
  }

  if (data === null) {
    displayData = 'NULL';
  }

  return { data, displayData };
}
