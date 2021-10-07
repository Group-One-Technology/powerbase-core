import React, { useState, useRef, useEffect } from 'react';
import {
  Grid,
  InfiniteLoader,
  AutoSizer,
  ScrollSync,
} from 'react-virtualized';
import PropTypes from 'prop-types';

import { useViewFields } from '@models/ViewFields';
import { useFieldTypes } from '@models/FieldTypes';
import { ITable } from '@lib/propTypes/table';
import { useDidMountEffect } from '@lib/hooks/useDidMountEffect';
import { ROW_NO_CELL_WIDTH, DEFAULT_CELL_WIDTH } from '@lib/constants';
import { SingleRecordModal } from '@components/record/SingleRecordModal';
import { TableHeader } from './TableHeader';
import { CellRenderer } from './CellRenderer';

export function TableRenderer({
  records,
  totalRecords,
  loadMoreRows,
  isLoading,
  height,
  tables,
  connections,
  referencedConnections,
}) {
  const { data: fieldTypes } = useFieldTypes();
  const { data: initialFields } = useViewFields();

  const recordsGridRef = useRef(null);
  const headerGridRef = useRef(null);
  const [fields, setFields] = useState(initialFields);

  const columnCount = fields && fields.length + 1;
  const fieldNames = fields.map((field) => field.name);
  const connectionsIndices = connections.map((item) => item.columns).flat()
    .map((item) => fieldNames.indexOf(item) + 1);

  const [hoveredCell, setHoveredCell] = useState({ row: null, column: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState();
  const isRowLoaded = ({ index }) => !!records[index];

  useEffect(() => {
    setFields(initialFields);
  }, [initialFields]);

  useDidMountEffect(() => {
    if (headerGridRef.current && recordsGridRef.current) {
      headerGridRef.current.forceUpdate();
      headerGridRef.current.recomputeGridSize();
      recordsGridRef.current.forceUpdate();
      recordsGridRef.current.recomputeGridSize();
    }
  }, [fields]);

  const handleLoadMoreRows = ({ stopIndex }) => {
    const stop = stopIndex / columnCount;

    if (
      !isLoading
      && stop + 100 > records.length
      && records.length - 1 !== totalRecords
    ) {
      loadMoreRows();
    }
  };

  const handleExpandRecord = (rowNo) => {
    setIsModalOpen(true);
    setSelectedRecord(fields.map((item, index) => {
      const connection = connectionsIndices.includes(index + 1)
        ? connections.find((key) => key.columns.includes(item.name))
        : undefined;

      return ({
        ...item,
        value: records[rowNo - 1][index + 1],
        isForeignKey: !!connection,
        isCompositeKey: connection?.columns.length > 1,
        foreignKey: connection
          ? ({
            ...connection,
            columnIndex: connection.columns.indexOf(item.name),
          })
          : undefined,
      });
    }));
  };

  return (
    <div className="w-full overflow-hidden z-0">
      <AutoSizer
        disableHeight
        onResize={() => {
          headerGridRef.current?.recomputeGridSize();
          recordsGridRef.current?.recomputeGridSize();
        }}
      >
        {({ width }) => (
          <ScrollSync>
            {({
              onScroll,
              scrollLeft,
              scrollHeight,
              clientHeight,
            }) => (
              <>
                <TableHeader
                  ref={headerGridRef}
                  scrollLeft={scrollLeft}
                  width={width}
                  hasScrollbar={scrollHeight > clientHeight}
                  fields={fields}
                  setFields={setFields}
                />
                <InfiniteLoader
                  isRowLoaded={isRowLoaded}
                  loadMoreRows={handleLoadMoreRows}
                  rowCount={totalRecords * columnCount}
                >
                  {({ onRowsRendered, registerChild }) => (
                    <Grid
                      ref={(instance) => {
                        if (instance) {
                          recordsGridRef.current = instance;
                          registerChild(instance);
                        }
                      }}
                      onScroll={onScroll}
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
                      cellRenderer={({ rowIndex, columnIndex, ...props }) => {
                        const isRowNo = columnIndex === 0;
                        const isLastRecord = rowIndex >= records.length - 1;
                        const isHoveredRow = hoveredCell.row === rowIndex;

                        return CellRenderer({
                          rowIndex,
                          columnIndex,
                          isLoaded: !!records[rowIndex],
                          value: records[rowIndex][columnIndex],
                          setHoveredCell,
                          isHoveredRow,
                          isRowNo,
                          isLastRecord,
                          isForeignKey: connectionsIndices.includes(columnIndex),
                          fieldTypeId: columnIndex !== 0
                            ? fields[columnIndex - 1].fieldTypeId
                            : undefined,
                          fieldTypes,
                          handleExpandRecord: isRowNo
                            ? handleExpandRecord
                            : undefined,
                          ...props,
                        });
                      }}
                      columnWidth={({ index }) => {
                        if (index === 0) {
                          return ROW_NO_CELL_WIDTH;
                        }
                        if (fields && fields[index - 1]?.width) {
                          return fields[index - 1].width;
                        }
                        return DEFAULT_CELL_WIDTH;
                      }}
                      columnCount={columnCount}
                      rowHeight={30}
                      rowCount={records.length}
                      height={height}
                      width={width}
                    />
                  )}
                </InfiniteLoader>
              </>
            )}
          </ScrollSync>
        )}
      </AutoSizer>
      {selectedRecord && (
        <SingleRecordModal
          open={isModalOpen}
          setOpen={setIsModalOpen}
          record={selectedRecord}
          tables={tables}
          connections={connections}
          referencedConnections={referencedConnections}
          fieldTypes={fieldTypes}
        />
      )}
    </div>
  );
}

TableRenderer.propTypes = {
  records: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.any)).isRequired,
  totalRecords: PropTypes.number,
  loadMoreRows: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  height: PropTypes.number.isRequired,
  tables: PropTypes.arrayOf(ITable),
  connections: PropTypes.array,
  referencedConnections: PropTypes.array,
};
