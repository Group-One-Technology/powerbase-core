/* eslint-disable react/prop-types */
import React from 'react';
import { Grid, InfiniteLoader, AutoSizer } from 'react-virtualized';
import PropTypes from 'prop-types';

import { IViewField } from '@lib/propTypes/view_field';
import { CellRenderer } from './CellRenderer';

export function TableRenderer({
  fields,
  records,
  totalRecords,
  loadMoreRows,
  isLoading,
  height,
}) {
  const columnCount = fields.length;
  const rowCount = records.length + 1;
  const tableValues = [
    ['', ...fields.map((field) => field.name)],
    ...records,
  ];

  const isRowLoaded = ({ index }) => !!tableValues[index];
  const handleLoadMoreRows = ({ stopIndex }) => {
    const stop = stopIndex / columnCount;

    if (!isLoading && stop + 100 > records.length) {
      loadMoreRows();
    }
  };

  return (
    <div className="w-full overflow-hidden z-0">
      <InfiniteLoader
        isRowLoaded={isRowLoaded}
        loadMoreRows={handleLoadMoreRows}
        rowCount={totalRecords * columnCount}
      >
        {({ onRowsRendered, registerChild }) => (
          <AutoSizer disableHeight>
            {({ width }) => (
              <Grid
                ref={registerChild}
                onSectionRendered={({
                  columnStartIndex,
                  columnStopIndex,
                  rowStartIndex,
                  rowStopIndex,
                }) => {
                  const startIndex = rowStartIndex * columnCount + columnStartIndex;
                  const stopIndex = rowStopIndex * columnCount + columnStopIndex;

                  return onRowsRendered({ startIndex, stopIndex });
                }}
                onRowsRendered={onRowsRendered}
                cellRenderer={({ rowIndex, columnIndex, ...props }) => CellRenderer({
                  rowIndex,
                  columnIndex,
                  isLoaded: !!tableValues[rowIndex],
                  value: tableValues[rowIndex][columnIndex],
                  ...props,
                })}
                columnWidth={({ index }) => (index === 0 ? 50 : fields[index - 1].width)}
                columnCount={columnCount}
                rowHeight={30}
                rowCount={rowCount}
                height={height}
                width={width}
              />
            )}
          </AutoSizer>
        )}
      </InfiniteLoader>
    </div>
  );
}

TableRenderer.propTypes = {
  fields: PropTypes.arrayOf(IViewField).isRequired,
  records: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.any),
  ).isRequired,
  totalRecords: PropTypes.number,
  loadMoreRows: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  height: PropTypes.number.isRequired,
};
