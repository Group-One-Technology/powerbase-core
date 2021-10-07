import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'react-virtualized';
import { SCROLLBAR_WIDTH, ROW_NO_CELL_WIDTH, DEFAULT_CELL_WIDTH } from '@lib/constants';
import { useFieldTypes } from '@models/FieldTypes';
import { useViewFields } from '@models/ViewFields';
import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';

function cellRenderer({
  rowIndex,
  columnIndex,
  field,
  fieldTypes,
  style,
}) {
  const key = `row-${rowIndex}-column-${columnIndex}`;

  if (columnIndex === 0 || !field) {
    return (
      <div
        key={key}
        className="bg-gray-100 text-sm focus:bg-gray-100 border-gray-200 border-r border-b py-1 px-2"
        style={style}
      />
    );
  }

  return (
    <div
      key={key}
      className="single-line bg-gray-100 text-sm truncate focus:bg-gray-100 border-r border-gray-200 items-center py-1 px-2"
      style={style}
    >
      <FieldTypeIcon typeId={field.fieldTypeId} fieldTypes={fieldTypes} className="mr-1" />
      <span>{field.name}</span>
    </div>
  );
}

CellRenderer.propTypes = {
  rowIndex: PropTypes.number.isRequired,
  columnIndex: PropTypes.number.isRequired,
  field: PropTypes.object,
  fieldTypes: PropTypes.array.isRequired,
  style: PropTypes.object,
};

export function TableHeader({ scrollLeft, width, hasScrollbar }) {
  const { data: fields } = useViewFields();
  const { data: fieldTypes } = useFieldTypes();

  return (
    <Grid
      scrollLeft={scrollLeft}
      rowCount={1}
      columnCount={fields.length + 1}
      columnWidth={({ index }) => {
        if (index === 0) return ROW_NO_CELL_WIDTH;
        if (fields[index - 1]) return fields[index - 1].width;
        return DEFAULT_CELL_WIDTH;
      }}
      rowHeight={30}
      height={30}
      width={hasScrollbar ? width - SCROLLBAR_WIDTH : width}
      className="scrollbar-none border-gray-200 border-b"
      cellRenderer={({ columnIndex, ...props }) => cellRenderer({
        ...props,
        columnIndex,
        field: fields[columnIndex - 1],
        fieldTypes,
      })}
    />
  );
}

TableHeader.propTypes = {
  scrollLeft: PropTypes.number,
  width: PropTypes.number,
  hasScrollbar: PropTypes.bool,
};
