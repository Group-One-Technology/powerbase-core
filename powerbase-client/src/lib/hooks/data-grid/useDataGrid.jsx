import React from 'react';
import { GridCellKind, getMiddleCenterBias } from '@glideapps/glide-data-grid';

import { useFieldTypes } from '@models/FieldTypes';
import { useBaseUser } from '@models/BaseUser';
import { useTableRecords } from '@models/TableRecords';
import { getColumnInfo } from '@lib/helpers/data-grid/getColumnInfo';
import { getCellValue } from '@lib/helpers/data-grid/getCellValue';
import { FieldType } from '@lib/constants/field-types';
import { isValidHttpUrl } from '@lib/helpers/isValidHttpUrl';
import { isValidEmail } from '@lib/helpers/isValidEmail';
import { FIELD_EDITABLE_VALIDATOR } from '@lib/validators/FIELD_EDITABLE_VALIDATOR';
import { CellEditor } from '@components/tables/TableGrid/CellEditor';
import { LinkCellEditor } from '@components/tables/TableGrid/LinkCellEditor';

const fieldTypeIcons = () => ({
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
    let editable = true;

    try {
      FIELD_EDITABLE_VALIDATOR({ baseUser, field, fieldType });
    } catch (err) {
      editable = false;
    }

    return ({
      ...getColumnInfo(field, fieldType),
      editable,
    });
  })
    .sort((x, y) => x.order > y.order);

  const getCellContent = React.useCallback((cell) => {
    const [col, row] = cell;
    const dataRow = records[row];
    const isNewRecord = records[row]?.new === true;

    if (dataRow == null) {
      return {
        kind: isNewRecord
          ? GridCellKind.Custom
          : GridCellKind.Loading,
        allowOverlay: false,
        readonly: true,
        displayData: '',
        data: null,
      };
    }

    const column = columns[col];
    const data = dataRow[column?.name];
    const newRecordOptions = isNewRecord
      ? {
        new: true,
        index: records[row].index,
        allowOverlay: true,
        readonly: false,
      }
      : {};
    const lastUpdated = highlightedCell === records[row].doc_id
      ? new Date()
      : undefined;

    if (isNewRecord && [GridCellKind.RowID, GridCellKind.Protected].includes(column.kind)) {
      newRecordOptions.kind = GridCellKind.Custom;
    }

    if (column) {
      const {
        field, fieldType, editable, ...options
      } = column;
      let isTruncated = false;

      const textCount = records[row][`${column.name}_count`];
      if ([FieldType.SINGLE_LINE_TEXT, FieldType.LONG_TEXT].includes(fieldType.name)
        && data != null && textCount != null) {
        if (data.length < textCount) {
          isTruncated = true;
        }
      }

      const additionalOptions = fieldType.name === FieldType.JSON_TEXT
        ? { displayData: data?.length ? '{ ... }' : '{}' }
        : {};

      if (isNewRecord && newRecordOptions.kind !== GridCellKind.Custom && field.isPii) {
        newRecordOptions.kind = GridCellKind.Custom;
      }

      return {
        ...options,
        ...getCellValue(column, data, isTruncated),
        row,
        col,
        editable,
        fieldType: fieldType.name,
        allowOverlay: editable,
        readonly: !editable && !isTruncated,
        lastUpdated,
        ...additionalOptions,
        ...newRecordOptions,
      };
    }

    return {
      kind: GridCellKind.Text,
      allowOverlay: true,
      readonly: false,
      displayData: data?.toString() ?? '',
      data: data ?? '',
      lastUpdated,
      ...newRecordOptions,
    };
  }, [table.id, columns, records]);

  const headerIcons = React.useMemo(fieldTypeIcons, []);

  const drawCustomCell = React.useCallback((ctx, cell, theme, rect) => {
    const isNewRecord = records[cell.row]?.new;

    if (cell.kind !== GridCellKind.Custom && cell.data !== null) {
      if (isNewRecord) {
        ctx.save();
        const { x, y, width, height } = rect;
        ctx.fillStyle = '#bfffcd';
        ctx.fillRect(x + 1, y + 1, width - 1, height - 1);
        ctx.restore();
      }

      return false;
    }

    ctx.save();
    const { x, y, width, height } = rect;

    if (isNewRecord) {
      ctx.fillStyle = '#bfffcd';
      ctx.fillRect(x + 1, y + 1, width - 1, height - 1);
    }

    const font = `${theme.baseFontStyle} ${theme.fontFamily}`;
    const fillStyle = cell.data === null
      ? theme.textLight
      : theme.textDark;

    ctx.fillStyle = fillStyle;
    ctx.font = font;

    const textX = x + theme.cellHorizontalPadding;
    const textY = y + height / 2 + getMiddleCenterBias(ctx, font);
    ctx.fillText(cell.displayData, textX, textY);

    if (cell.data != null
      && ((cell.fieldType === FieldType.URL && isValidHttpUrl(cell.data))
        || (cell.fieldType === FieldType.EMAIL && isValidEmail(cell.data)))) {
      const textWidth = ctx.measureText(cell.displayData).width;
      ctx.fillRect(textX, textY + 6, textWidth, 1);
    }

    ctx.restore();

    return true;
  }, [records]);

  const provideEditor = React.useCallback((cell) => {
    if (cell.kind === GridCellKind.Custom) {
      if ([FieldType.EMAIL, FieldType.URL].includes(cell.fieldType)) {
        return (props) => LinkCellEditor(props);
      }

      return (props) => CellEditor(props);
    }

    return undefined;
  }, []);

  return {
    columns,
    getCellContent,
    headerIcons,
    drawCustomCell,
    provideEditor,
  };
}
