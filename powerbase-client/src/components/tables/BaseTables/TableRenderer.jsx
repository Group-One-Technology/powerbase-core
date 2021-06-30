import React from 'react';
import { Grid, InfiniteLoader, AutoSizer } from 'react-virtualized';
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

  // TODO: Replace with SWR Infinite API
  const totalRowCount = 10000;
  const isRowLoaded = ({ index }) => !!tableValues[index];
  const loadMoreRows = () => {
    console.log('loading more...');
  };

  return (
    <div className="w-full overflow-hidden z-0">
      <InfiniteLoader
        isRowLoaded={isRowLoaded}
        loadMoreRows={loadMoreRows}
        rowCount={totalRowCount}
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

                  onRowsRendered({ startIndex, stopIndex });
                }}
                cellRenderer={({ rowIndex, columnIndex, ...props }) => CellRenderer({
                  rowIndex,
                  columnIndex,
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
  height: PropTypes.number.isRequired,
};
