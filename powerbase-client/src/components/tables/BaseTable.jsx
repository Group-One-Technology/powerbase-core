import { useWindowSize } from '@lib/hooks/useWindowSize';
import React, { useState } from 'react';
import { ArrowKeyStepper, Grid, AutoSizer } from 'react-virtualized';
import { tableValuesMock } from '@lib/mock/tableValuesMock';
import cn from 'classnames';
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
  }) => (
    <div
      role="button"
      id={`row-${rowIndex}_col-${columnIndex}`}
      key={key}
      className={cn(
        'single-line text-base truncate focus:bg-gray-100',
      )}
      onClick={() => setCurrentCell({ row: rowIndex, column: columnIndex })}
      style={style}
      tabIndex={0}
      onKeyDown={(evt) => {
        const el = evt.target;

        if (evt.code === 'Enter') {
          el.contentEditable = el.contentEditable !== 'true';
        } else if (el.contentEditable !== 'true') {
          setCurrentCell({ row: rowIndex, column: columnIndex });
        }
      }}
      onDoubleClick={(evt) => {
        evt.target.contentEditable = true;
      }}
      onBlur={(evt) => {
        evt.target.contentEditable = false;
      }}
      suppressContentEditableWarning
    >
      {tableValuesMock[rowIndex][columnIndex]}
    </div>
  );

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
                columnWidth={200}
                columnCount={columnCount}
                rowHeight={40}
                rowCount={rowCount}
                height={windowSize.height ? windowSize.height - 85 : 0}
                width={width}
              />
            )}
          </AutoSizer>
        )}
      </ArrowKeyStepper>
    </div>
  );
}
