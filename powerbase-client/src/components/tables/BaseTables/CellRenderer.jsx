import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { ArrowsExpandIcon } from '@heroicons/react/outline';

import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';

function CellValue({
  value,
  isLoaded,
  isHeader,
  isRowNo,
  isHoveredRow,
  isLastRecord,
}) {
  if (isHeader || isLoaded) {
    if (isRowNo && !isHeader) {
      return (
        <>
          <span className="flex-1 text-right mr-4">{value?.toString()}</span>
          <span className="flex-1">
            {(isHoveredRow && !isLastRecord) && (
              <button
                type="button"
                className="inline-flex items-center p-0.5 border border-transparent rounded-full text-indigo-600 hover:bg-indigo-100 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-indigo-100"
                // TODO: Add View Record Modal
                onClick={() => alert('show view record modal')}
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
        {(isHeader && !isRowNo) && <FieldTypeIcon className="mr-1" />}
        {value?.toString()}
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
};

export function CellRenderer({
  columnIndex,
  key,
  rowIndex,
  isLoaded,
  style,
  value,
  hoveredCell,
  setHoveredCell,
  isLastRecord,
}) {
  const isHeader = rowIndex === 0;
  const isRowNo = columnIndex === 0;
  const isHoveredRow = hoveredCell.row === rowIndex;

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
        'single-line text-sm truncate focus:bg-gray-100 border-b border-gray-200 flex items-center py-1 px-2',
        isHeader && 'bg-gray-100',
        isRowNo && 'flex justify-center text-xs text-gray-500',
        !isRowNo && 'border-r',
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
      />
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
  hoveredCell: PropTypes.object.isRequired,
  setHoveredCell: PropTypes.func.isRequired,
  isLastRecord: PropTypes.bool.isRequired,
};
