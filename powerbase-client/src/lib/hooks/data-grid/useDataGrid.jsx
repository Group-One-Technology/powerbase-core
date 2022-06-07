import React from 'react';
import { GridCellKind } from '@glideapps/glide-data-grid';

import { useFieldTypes } from '@models/FieldTypes';
import { useBaseUser } from '@models/BaseUser';
import { getColumnInfo } from '@lib/helpers/data-grid/getColumnInfo';
import { getCellValue } from '@lib/helpers/data-grid/getCellValue';
import { FieldType } from '@lib/constants/field-types';
import { FIELD_EDITABLE_VALIDATOR } from '@lib/validators/FIELD_EDITABLE_VALIDATOR';
import { useTableRecords } from '@models/TableRecords';

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
  const { baseUser } = useBaseUser();
  const { data: fieldTypes } = useFieldTypes();
  const { highlightedCell } = useTableRecords();

  const columns = fields.map((field) => {
    const fieldType = fieldTypes?.find((item) => item.id === field.fieldTypeId);
    let isEditable = true;

    try {
      FIELD_EDITABLE_VALIDATOR({ baseUser, field, fieldType });
    } catch (err) {
      isEditable = false;
    }

    return ({
      ...getColumnInfo(field, fieldType),
      fieldType,
      isEditable,
    });
  })
    .sort((x, y) => x.order > y.order);

  const getContent = React.useCallback((cell) => {
    const [col, row] = cell;
    const dataRow = records[row];
    const column = columns[col];
    const data = dataRow[column?.name];

    if (data == null) {
      return {
        kind: GridCellKind.Text,
        allowOverlay: true,
        readonly: false,
        displayData: 'NULL',
        data,
      };
    }

    if (column) {
      const { field, isEditable, ...options } = column;
      let isTruncated = false;

      const textCount = records[row][`${column.name}_count`];
      if ([FieldType.SINGLE_LINE_TEXT, FieldType.LONG_TEXT].includes(column.fieldType.name) && data != null && textCount != null) {
        if (data.length < textCount) {
          isTruncated = true;
        }
      }

      return {
        ...options,
        ...getCellValue(column, data),
        allowOverlay: isEditable && !isTruncated,
        readonly: !isEditable && !isTruncated,
        lastUpdated: highlightedCell === records[row].doc_id
          ? new Date()
          : undefined,
      };
    }

    return {
      kind: GridCellKind.Text,
      allowOverlay: true,
      readonly: false,
      displayData: data?.toString() ?? '',
      data: data ?? '',
    };
  }, [table.id, columns, records]);

  const getHeaderIcons = React.useMemo(headerIcons, []);

  const drawCustomCell = React.useCallback((ctx, cell, _theme, rect) => {
    if (cell.kind === GridCellKind.RowID || cell.data !== null) return false;

    ctx.save();
    const { x, y, height } = rect;

    ctx.fillStyle = '#9CA3AF';
    ctx.font = 'normal 14px sans-serif';
    ctx.fillText(cell.displayData, x + 8 + 0.5, y + height / 2 + 0.2);
    ctx.restore();

    return true;
  }, []);

  return {
    columns,
    getContent,
    getHeaderIcons,
    drawCustomCell,
  };
}
