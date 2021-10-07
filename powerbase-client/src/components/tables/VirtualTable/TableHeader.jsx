import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'react-virtualized';
import Draggable from 'react-draggable';
import { DotsVerticalIcon } from '@heroicons/react/outline';

import { useFieldTypes } from '@models/FieldTypes';
import { useViewFields } from '@models/ViewFields';
import { securedApi } from '@lib/api/index';
import { SCROLLBAR_WIDTH, ROW_NO_CELL_WIDTH, DEFAULT_CELL_WIDTH } from '@lib/constants';
import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';

function CellRenderer({
  rowIndex,
  columnIndex,
  field,
  fieldTypes,
  handleResizeColumn,
  handleResizeStop,
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

      <Draggable
        axis="x"
        defaultClassName="DragHandle"
        defaultClassNameDragging="DragHandleActive"
        position={{ x: 0 }}
        onDrag={(evt, { deltaX }) => handleResizeColumn(columnIndex - 1, deltaX)}
        onStop={handleResizeStop}
        zIndex={999}
      >
        <span><DotsVerticalIcon className="DragHandleIcon cursor-x h-3 w-3" /></span>
      </Draggable>
    </div>
  );
}

CellRenderer.propTypes = {
  rowIndex: PropTypes.number.isRequired,
  columnIndex: PropTypes.number.isRequired,
  field: PropTypes.object,
  fieldTypes: PropTypes.array.isRequired,
  handleResizeColumn: PropTypes.func.isRequired,
  handleResizeStop: PropTypes.func.isRequired,
  style: PropTypes.object,
};

export const TableHeader = React.forwardRef(({
  fields,
  setFields,
  scrollLeft,
  width,
  hasScrollbar,
}, ref) => {
  const { mutate: mutateViewFields } = useViewFields();
  const { data: fieldTypes } = useFieldTypes();
  const [resizedColumn, setResizedColumn] = useState();

  const handleResizeColumn = (columnIndex, deltaX) => {
    const updatedColumns = fields.map((field, index) => {
      if (columnIndex === index) {
        setResizedColumn(field);

        return {
          ...field,
          width: Math.max(field.width + deltaX, 10),
          resized: true,
        };
      }

      return field;
    });

    setFields(updatedColumns);
  };

  const handleResizeStop = () => {
    const updatedColumn = resizedColumn;
    let response;

    const updateColumnWidth = async () => {
      try {
        response = await securedApi.put(
          `/fields/${updatedColumn.id}/resize`,
          updatedColumn,
        );
      } catch (error) {
        console.log(error);
      }
      if (response.statusText === 'OK') {
        const mutatedColList = fields.map((column) => ({
          ...column,
          width: column.id === updatedColumn.id
            ? updatedColumn.width
            : column.width,
        }));

        mutateViewFields(mutatedColList);
      }
    };

    return updateColumnWidth();
  };

  return (
    <Grid
      ref={ref}
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
      cellRenderer={({ columnIndex, ...props }) => CellRenderer({
        ...props,
        columnIndex,
        field: fields[columnIndex - 1],
        fieldTypes,
        handleResizeColumn,
        handleResizeStop,
      })}
    />
  );
});

TableHeader.propTypes = {
  fields: PropTypes.array.isRequired,
  setFields: PropTypes.func.isRequired,
  scrollLeft: PropTypes.number,
  width: PropTypes.number,
  hasScrollbar: PropTypes.bool,
};
