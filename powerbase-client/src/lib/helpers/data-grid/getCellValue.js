import { GridCellKind } from '@glideapps/glide-data-grid';

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
export function getCellValue(column, data = '') {
  const value = column.kind === GridCellKind.Bubble
    ? [data.toString()]
    : column.kind === GridCellKind.Number
      ? data
      : column.kind === GridCellKind.Boolean
        ? data.toString() === 'true'
        : data.toString();

  return {
    data: value,
    displayData: Array.isArray(value)
      ? value.join(', ')
      : value.toString(),
  };
}
