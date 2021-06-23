import React, { useState } from 'react';
import { ArrowKeyStepper, Grid, AutoSizer } from 'react-virtualized';
import PropTypes from 'prop-types';

import { IViewField } from '@lib/propTypes/view_field';
import { CellRenderer } from './CellRenderer';

export function TableRenderer({ fields, records, height }) {
  const columnCount = fields.length;
  const rowCount = records.length + 1;
  const tableValues = [
    ['', ...fields.map((field) => field.name)],
    ...records,
  ];

  const [currentCell, setCurrentCell] = useState({
    row: 0,
    column: 0,
  });

  const handleScrollToChange = ({ scrollToRow, scrollToColumn }) => {
    const editableElement = document.querySelector('[contenteditable=true]');

    if (!editableElement) {
      setCurrentCell({ row: scrollToRow, column: scrollToColumn });
      const focusedCell = document.getElementById(`row-${scrollToRow}_col-${scrollToColumn}`);
      focusedCell.focus();
    }
  };

  return (
    <div className="w-full overflow-hidden z-0">
      <ArrowKeyStepper
        mode="cells"
        columnCount={columnCount}
        rowCount={rowCount}
        onScrollToChange={handleScrollToChange}
        scrollToColumn={currentCell.column}
        scrollToRow={currentCell.row}
        isControlled
      >
        {({ onSectionRendered, scrollToColumn, scrollToRow }) => (
          <AutoSizer disableHeight>
            {({ width }) => (
              <Grid
                onSectionRendered={onSectionRendered}
                scrollToColumn={scrollToColumn}
                scrollToRow={scrollToRow}
                cellRenderer={({ rowIndex, columnIndex, ...props }) => CellRenderer({
                  scrollToColumn,
                  scrollToRow,
                  rowIndex,
                  columnIndex,
                  setCurrentCell,
                  value: tableValues[rowIndex][columnIndex],
                  ...props,
                })}
                columnWidth={({ index }) => (index === 0 ? 50 : fields[index].width)}
                columnCount={columnCount}
                rowHeight={30}
                rowCount={rowCount}
                height={height}
                width={width}
              />
            )}
          </AutoSizer>
        )}
      </ArrowKeyStepper>
    </div>
  );
}

TableRenderer.propTypes = {
  fields: PropTypes.arrayOf(IViewField).isRequired,
  records: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.any),
  ).isRequired,
  height: PropTypes.number.isRequired,
};
