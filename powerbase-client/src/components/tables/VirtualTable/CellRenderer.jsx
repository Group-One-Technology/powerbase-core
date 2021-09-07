/* eslint-disable no-unused-vars */
/* eslint-disable comma-dangle */
/* eslint-disable quotes */
import React, { useRef } from "react";
import PropTypes from "prop-types";
import cn from "classnames";
import { ArrowsExpandIcon } from "@heroicons/react/outline";
import Draggable from "react-draggable";

import { FieldTypeIcon } from "@components/ui/FieldTypeIcon";

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
  if (isHeader || isLoaded) {
    if (isRowNo && !isHeader) {
      return (
        <>
          <span className="flex-1 text-right mr-4">{value?.toString()}</span>
          <span className="flex-1">
            {isHoveredRow && !isLastRecord && (
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

    return (
      <>
        {isHeader && fieldTypeId != null && (
          <FieldTypeIcon
            typeId={fieldTypeId}
            fieldTypes={fieldTypes}
            className="mr-1"
          />
        )}
        <span
          className={cn(
            isForeignKey && !isHeader && "px-2 py-0.25 bg-blue-50 rounded"
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
  // eslint-disable-next-line react/prop-types
  handleResizeCol,
}) {
  const handleMouseEnter = () => {
    setHoveredCell({
      row: rowIndex,
      column: columnIndex,
    });
  };

  return (
    <div
      role="button"
      id={`row-${rowIndex}_col-${columnIndex}`}
      key={key}
      className={cn(
        "single-line text-sm truncate focus:bg-gray-100 border-b border-gray-200 flex items-center py-1 px-2",
        isHeader && !isHoveredRow && "bg-gray-100",
        isHoveredRow && "bg-gray-50",
        isRowNo && "flex justify-center text-xs text-gray-500",
        !isRowNo && "border-r"
      )}
      style={style}
      tabIndex={0}
      onKeyDown={(evt) => {
        const el = evt.target;

        if (evt.code === "Enter" && !isRowNo) {
          el.contentEditable = el.contentEditable !== "true";
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
          zIndex={999}
        >
          <div className="DragHandleIcon">⋮</div>
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
};
