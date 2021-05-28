import { useWindowSize } from '@lib/hooks/useWindowSize';
import React, { useState } from 'react';
import { ArrowKeyStepper, Grid, AutoSizer } from 'react-virtualized';
import cn from 'classnames';

import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';
import { tableValuesMock } from '@lib/mock/tableValuesMock';
import 'react-virtualized/styles.css';

export function BaseTable() {
  const windowSize = useWindowSize();
  const columnCount = tableValuesMock[0].length;
  const rowCount = tableValuesMock.length;

  const [currentCell, setCurrentCell] = useState({
    row: 0,
    column: 0,
  });

  const cellRenderer = ({
    columnIndex,
    key,
    rowIndex,
    style,
  }) => {
    const isHeader = rowIndex === 0;
    const isRowNo = columnIndex === 0;

    return (
      <div
        role="button"
        id={`row-${rowIndex}_col-${columnIndex}`}
        key={key}
        className={cn(
          'single-line text-sm truncate focus:bg-gray-100 border-b border-r border-gray-200 flex items-center py-1 px-2',
          isHeader && 'bg-gray-100',
          isRowNo && 'flex justify-center text-xs text-gray-500',
        )}
        onClick={() => setCurrentCell({ row: rowIndex, column: columnIndex })}
        style={style}
        tabIndex={0}
        onKeyDown={(evt) => {
          const el = evt.target;

          if (evt.code === 'Enter' && !isRowNo) {
            el.contentEditable = el.contentEditable !== 'true';
          } else if (el.contentEditable !== 'true') {
            setCurrentCell({ row: rowIndex, column: columnIndex });
          }
        }}
        onDoubleClick={(evt) => {
          if (!isRowNo) evt.target.contentEditable = true;
        }}
        onBlur={(evt) => {
          if (!isRowNo) evt.target.contentEditable = false;
        }}
        suppressContentEditableWarning
      >
        {(isHeader && columnIndex !== 0) && <FieldTypeIcon className="mr-1" />}
        {tableValuesMock[rowIndex][columnIndex]}
      </div>
    );
  };

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
                cellRenderer={(props) => cellRenderer({
                  scrollToColumn,
                  scrollToRow,
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
