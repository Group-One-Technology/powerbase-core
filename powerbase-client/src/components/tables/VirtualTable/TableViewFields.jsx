/* eslint-disable react/prop-types */
import React from 'react';
import { Grid } from 'react-virtualized';
import { useFieldTypes } from '@models/FieldTypes';
import { useViewFields } from '@models/ViewFields';
import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';

function cellRenderer({
  rowIndex, columnIndex, field, fieldTypes, style,
}) {
  if (columnIndex === 0) {
    return <div key={`row-${rowIndex}-column-${columnIndex}`} className="bg-gray-100 text-sm focus:bg-gray-100 border-gray-200 border-r border-b py-1 px-2" style={style} />;
  }

  return (
    <div key={`row-${rowIndex}-column-${columnIndex}`} className="single-line bg-gray-100 text-sm truncate focus:bg-gray-100 border-r border-gray-200 items-center py-1 px-2" style={style}>
      <FieldTypeIcon typeId={field.fieldTypeId} fieldTypes={fieldTypes} className="mr-1" />
      <span>{field.name}</span>
    </div>
  );
}

export function TableViewFields({ scrollLeft, width }) {
  const { data: fields } = useViewFields();
  const { data: fieldTypes } = useFieldTypes();

  return (
    <Grid
      scrollLeft={scrollLeft}
      width={width}
      cellRenderer={({ columnIndex, ...props }) => cellRenderer({
        ...props,
        columnIndex,
        field: fields[columnIndex - 1],
        fieldTypes,
      })}
      rowCount={1}
      columnCount={fields.length + 1}
      columnWidth={({ index }) => {
        if (index === 0) {
          return 80;
        }
        if (fields[index - 1]?.width) {
          return fields[index - 1].width;
        }

        return 300;
      }}
      rowHeight={30}
      height={30}
      className="scrollbar-none border-gray-200 border-b"
    />
  );
}
