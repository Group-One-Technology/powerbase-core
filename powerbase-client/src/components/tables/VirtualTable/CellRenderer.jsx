/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { ArrowsExpandIcon, DotsVerticalIcon } from '@heroicons/react/outline';
import Draggable from 'react-draggable';
import { securedApi } from '@lib/api/index';

import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';
import { FieldType } from '@lib/constants/field-types';

function CellValue({
  value,
  isLoaded,
  isHeader,
  isRowNo,
  isHoveredRow,
  isLastRecord,
  isForeignKey,
  fieldTypeId,
  fieldTypes,
  handleExpandRecord,
}) {
  const fieldType = fieldTypeId
    ? fieldTypes?.find((item) => item.id.toString() === fieldTypeId.toString())
    : undefined;

  if (isHeader || isLoaded) {
    if (!isHeader) {
      if (isRowNo) {
        return (
          <>
            <span className="flex-1 text-right mr-4">
              {value?.toString()}
            </span>
            <span className="flex-1">
              {(isHoveredRow && !isLastRecord) && (
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
              )}
            </span>
          </>
        );
      }

      if (fieldType?.name === FieldType.CHECKBOX) {
        return (
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            checked={value?.toString() === 'true'}
            readOnly
          />
        );
      }
    }

    return (
      <>
        {(isHeader && fieldTypeId != null) && (
          <FieldTypeIcon fieldType={fieldType} className="mr-1" />
        )}
        <span
          className={cn(
            isForeignKey && !isHeader && 'px-2 py-0.25 bg-blue-50 rounded',
          )}
        >
          {value?.toString()}
        </span>
      </>
    );
  }

  return <span className="h-5 bg-gray-200 rounded w-full animate-pulse" />;
}

CellValue.propTypes = {
  value: PropTypes.any,
  isLoaded: PropTypes.bool.isRequired,
  isHeader: PropTypes.bool.isRequired,
  isRowNo: PropTypes.bool.isRequired,
  isHoveredRow: PropTypes.bool.isRequired,
  isLastRecord: PropTypes.bool.isRequired,
  isForeignKey: PropTypes.bool.isRequired,
  fieldTypeId: PropTypes.number,
  fieldTypes: PropTypes.array.isRequired,
  handleExpandRecord: PropTypes.func,
};

export function CellRenderer({
  key,
  columnIndex,
  rowIndex,
  isLoaded,
  style,
  value,
  setHoveredCell,
  isHeader,
  isHoveredRow,
  isRowNo,
  isLastRecord,
  isForeignKey,
  fieldTypeId,
  fieldTypes,
  handleExpandRecord,
  handleResizeCol,
  columnResized,
  mutateViewFields,
  fields,
}) {
  const handleMouseEnter = () => {
    setHoveredCell({
      row: rowIndex,
      column: columnIndex,
    });
  };

  const handleResizeStop = (updatedColumn, remoteColumns) => {
    let response;
    console.log(updatedColumn)
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
        const mutatedColList = remoteColumns.map((column) => ({
          ...column,
          width: column.id === updatedColumn.id ? updatedColumn.width : column.width,
        }));
        mutateViewFields(mutatedColList);
      }
    };
    return updateColumnWidth();
  };

  return (
    <div
      role="button"
      id={`row-${rowIndex}_col-${columnIndex}`}
      key={key}
      className={cn(
        'single-line text-sm truncate focus:bg-gray-100 border-b border-gray-200 flex items-center py-1 px-2',
        isHeader && !isHoveredRow && 'bg-gray-100',
        isHoveredRow && 'bg-gray-50',
        isRowNo && 'flex justify-center text-xs text-gray-500',
        !isRowNo && 'border-r',
        !isHeader && !isRowNo && 'resized',
      )}
      style={style}
      tabIndex={0}
      onKeyDown={(evt) => {
        const el = evt.target;

        if (evt.code === 'Enter' && !isRowNo) {
          el.contentEditable = el.contentEditable !== 'true';
        }
      }}
      onDoubleClick={(evt) => {
        if (!isRowNo) evt.target.contentEditable = true;
      }}
      onBlur={(evt) => {
        if (!isRowNo) evt.target.contentEditable = false;
      }}
      onMouseEnter={handleMouseEnter}
      suppressContentEditableWarning
    >
      <CellValue
        value={value}
        isLoaded={isLoaded}
        isHeader={isHeader}
        isRowNo={isRowNo}
        isHoveredRow={isHoveredRow}
        isLastRecord={isLastRecord}
        isForeignKey={isForeignKey}
        fieldTypeId={fieldTypeId}
        fieldTypes={fieldTypes}
        handleExpandRecord={handleExpandRecord}
      />
      {rowIndex === 0 && columnIndex !== 0 && (
        <Draggable
          axis="x"
          defaultClassName="DragHandle"
          defaultClassNameDragging="DragHandleActive"
          position={{ x: 0 }}
          onDrag={(e, { deltaX }) => handleResizeCol(columnIndex - 1, deltaX)}
          onStop={() => handleResizeStop(columnResized, fields)}
          zIndex={999}
        >
          <span><DotsVerticalIcon className="DragHandleIcon cursor-x h-3 w-3"/></span>
        </Draggable>
      )}
    </div>
  );
}

CellRenderer.propTypes = {
  key: PropTypes.number.isRequired,
  rowIndex: PropTypes.number.isRequired,
  columnIndex: PropTypes.number.isRequired,
  isLoaded: PropTypes.bool.isRequired,
  style: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
  setHoveredCell: PropTypes.func.isRequired,
  isHeader: PropTypes.bool.isRequired,
  isHoveredRow: PropTypes.bool.isRequired,
  isRowNo: PropTypes.bool.isRequired,
  isLastRecord: PropTypes.bool.isRequired,
  isForeignKey: PropTypes.bool.isRequired,
  fieldTypeId: PropTypes.number,
  fieldTypes: PropTypes.array.isRequired,
  handleExpandRecord: PropTypes.func,
  mutateViewFields: PropTypes.func,
  handleResizeCol: PropTypes.func,
  fields: PropTypes.array,
  columnResized: PropTypes.object,
};
