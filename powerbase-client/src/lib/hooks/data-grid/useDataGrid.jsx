import React from 'react';
import { GridCellKind } from '@glideapps/glide-data-grid';

import { useFieldTypes } from '@models/FieldTypes';
import { getColumnInfo } from '@lib/helpers/data-grid/getColumnInfo';
import { getCellValue } from '@lib/helpers/data-grid/getCellValue';
import { FieldType } from '@lib/constants/field-types';

const headerIcons = () => ({
  [FieldType.LONG_TEXT]: ({ fgColor, bgColor }) => `
    <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" fill="none" viewBox="0 0 24 24" stroke-width="2">
    <rect x="2.00015" y="2" width="20" height="20" rx="4" fill="${bgColor}"/>
    <g width="15" height="15" stroke="${fgColor}">
      <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h10M7 12h10M7 17h6" />
    </g>
  </svg>`,
});

export function useDataGrid({ table, records, fields }) {
  const { data: fieldTypes } = useFieldTypes();
  const columns = fields.map((field) => getColumnInfo(field, fieldTypes))
    .sort((x, y) => x.order > y.order);

  const getContent = React.useCallback((cell) => {
    const [col, row] = cell;
    const dataRow = records[row];
    const column = columns[col];
    const data = dataRow[column?.name];

    if (data == null) {
      return {
        kind: GridCellKind.Text,
        allowOverlay: false,
        displayData: '',
        data: '',
      };
    }

    if (column) {
      const { field, ...options } = column;
      return { ...options, ...getCellValue(column, data) };
    }

    return {
      kind: GridCellKind.Text,
      allowOverlay: false,
      displayData: data?.toString() ?? '',
      data: data ?? '',
    };
  }, [table.id, columns, records]);

  const getHeaderIcons = React.useMemo(headerIcons, []);

  return {
    columns,
    getContent,
    getHeaderIcons,
  };
}
