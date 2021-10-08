import React from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { Grid } from 'react-virtualized';
import Draggable from 'react-draggable';
import { DotsVerticalIcon } from '@heroicons/react/outline';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { restrictToHorizontalAxis, restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers';

import { useFieldTypes } from '@models/FieldTypes';
import { SCROLLBAR_WIDTH, ROW_NO_CELL_WIDTH, DEFAULT_CELL_WIDTH } from '@lib/constants/index';
import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';
import { DroppableArea } from '@components/ui/DroppableArea';
import { DraggableItem } from '@components/ui/DraggableItem';
import { useReorderFields } from '@lib/hooks/virtual-table/useReorderFields';
import { useResizeFields } from '@lib/hooks/virtual-table/useResizeFields';

const GRID_HEADER_HEIGHT = 30;

function CellRenderer({
  rowIndex,
  columnIndex,
  field,
  fieldTypes,
  dragging,
  handleResizeColumn,
  handleResizeStop,
  style,
}) {
  const key = `row-${rowIndex}-column-${columnIndex}`;
  const droppableArea = (
    <DroppableArea
      id={`arearight-${key}`}
      data={{ index: columnIndex - 1, accepts: ['column'] }}
      className={cn(
        'absolute z-10 rounded-md hover:bg-indigo-400',
        dragging && dragging.active && dragging.over?.id === `arearight-${key}` && 'bg-indigo-400',
      )}
      style={{
        height: style.height - 4,
        width: 4,
        top: 2,
        left: style.left + style.width - 2,
      }}
    />
  );

  if (columnIndex === 0 || !field) {
    return (
      <React.Fragment key={key}>
        <div
          className="bg-gray-100 text-sm focus:bg-gray-100 border-gray-200 border-r border-b py-1 px-2"
          style={style}
        />
        {droppableArea}
      </React.Fragment>
    );
  }

  return (
    <React.Fragment key={key}>
      <div
        id={key}
        className="single-line bg-gray-100 focus:bg-gray-100 border-r border-gray-200 py-1 px-2 flex items-center truncate text-sm"
        style={style}
      >
        <DraggableItem id={key} data={{ type: 'column', index: columnIndex - 1, field }} className="absolute w-full h-full" />
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
      {droppableArea}
    </React.Fragment>
  );
}

CellRenderer.propTypes = {
  rowIndex: PropTypes.number.isRequired,
  columnIndex: PropTypes.number.isRequired,
  field: PropTypes.object,
  fieldTypes: PropTypes.array.isRequired,
  dragging: PropTypes.object,
  handleResizeColumn: PropTypes.func.isRequired,
  handleResizeStop: PropTypes.func.isRequired,
  style: PropTypes.object,
};

export const TableHeader = React.forwardRef(({
  fields,
  setFields,
  height,
  width,
  onScroll,
  scrollLeft,
  hasScrollbar,
}, ref) => {
  const { data: fieldTypes } = useFieldTypes();
  const { handleResizeColumn, handleResizeStop } = useResizeFields({ fields, setFields });
  const {
    dragging,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = useReorderFields({ setFields });

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis, restrictToFirstScrollableAncestor]}
    >
      <Grid
        ref={ref}
        onScroll={onScroll}
        scrollLeft={scrollLeft}
        rowCount={1}
        columnCount={fields.length + 1}
        columnWidth={({ index }) => {
          if (index === 0) return ROW_NO_CELL_WIDTH;
          if (fields[index - 1]) return fields[index - 1].width;
          return DEFAULT_CELL_WIDTH;
        }}
        rowHeight={GRID_HEADER_HEIGHT}
        height={GRID_HEADER_HEIGHT}
        width={hasScrollbar ? width - SCROLLBAR_WIDTH : width}
        className="scrollbar-none border-gray-200 border-b"
        cellRenderer={({ columnIndex, ...props }) => CellRenderer({
          ...props,
          columnIndex,
          field: fields[columnIndex - 1],
          fieldTypes,
          dragging,
          handleResizeColumn,
          handleResizeStop,
        })}
      />

      <DragOverlay>
        {dragging?.active.data.current?.field && (
          <div
            className="bg-gray-900 bg-opacity-10"
            style={{
              width: dragging.active.data.current.field.width,
              height: height + GRID_HEADER_HEIGHT,
            }}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
});

TableHeader.propTypes = {
  fields: PropTypes.array.isRequired,
  setFields: PropTypes.func.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  onScroll: PropTypes.func.isRequired,
  scrollLeft: PropTypes.number,
  hasScrollbar: PropTypes.bool,
};
