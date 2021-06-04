import { useWindowSize } from '@lib/hooks/useWindowSize';
import React, { useState } from 'react';
import { ArrowKeyStepper, Grid, AutoSizer } from 'react-virtualized';
import PropTypes from 'prop-types';

import { CellRenderer } from './CellRenderer';
import 'react-virtualized/styles.css';

export function BaseTable({ fields }) {
  const windowSize = useWindowSize();
  const columnCount = fields?.length;
  const rowCount = 2;
  const records = fields
    ? [['', ...fields.map((item) => item.name)], [1, ...fields.map((item) => item.name)]]
    : undefined;

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

  if (fields == null) {
    return (
      <div>
        Loading...
      </div>
    );
  }

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
                  value: records[rowIndex][columnIndex],
                  ...props,
                })}
                columnWidth={({ index }) => (index === 0 ? 50 : 300)}
                columnCount={columnCount}
                rowHeight={30}
                rowCount={rowCount}
                height={windowSize.height ? windowSize.height - 125 : 0}
                width={width}
              />
            )}
          </AutoSizer>
        )}
      </ArrowKeyStepper>
    </div>
  );
}

BaseTable.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.object),
};
