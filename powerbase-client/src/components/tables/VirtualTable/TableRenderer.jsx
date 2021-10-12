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
import { useTableRecords } from '@models/TableRecords';
import { useTableRecordsCount } from '@models/TableRecordsCount';
import { useTableConnections } from '@models/TableConnections';
import { useTableReferencedConnections } from '@models/TableReferencedConnections';

import { ITable } from '@lib/propTypes/table';
import { useDidMountEffect } from '@lib/hooks/useDidMountEffect';
import { ROW_NO_CELL_WIDTH, DEFAULT_CELL_WIDTH } from '@lib/constants';
import { SingleRecordModal } from '@components/record/SingleRecordModal';
import { GridHeader } from './GridHeader';
import { CellRenderer } from './CellRenderer';

export function TableRenderer({ height, table, tables }) {
  const { data: fieldTypes } = useFieldTypes();
  const { data: initialFields } = useViewFields();
  const { data: totalRecords } = useTableRecordsCount();
  const { data: records, loadMore: loadMoreRows, isLoading } = useTableRecords();
  const { data: connections } = useTableConnections();
  const { data: referencedConnections } = useTableReferencedConnections();

  const recordsGridRef = useRef(null);
  const headerGridRef = useRef(null);
  const [fields, setFields] = useState(initialFields.filter((item) => !item.isHidden));

  const columnCount = fields && fields.length + 1;
  const connectionFields = connections.map((item) => item.columns).flat();

  const [hoveredCell, setHoveredCell] = useState({ row: null, column: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState();

  const isRowLoaded = ({ index }) => !!records[index];

  useEffect(() => {
    setFields(initialFields.filter((item) => !item.isHidden));
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
    setSelectedRecord(initialFields.map((item) => {
      const connection = connectionFields.includes(item.name)
        ? connections.find((key) => key.columns.includes(item.name))
        : undefined;

      return ({
        ...item,
        value: records[rowNo - 1][item.name],
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
                <GridHeader
                  ref={headerGridRef}
                  table={table}
                  fields={fields}
                  setFields={setFields}
                  width={width}
                  height={height}
                  onScroll={onScroll}
                  scrollLeft={scrollLeft}
                  hasScrollbar={scrollHeight > clientHeight}
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
                      scrollLeft={scrollLeft}
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
                        const field = fields[columnIndex - 1];
                        const isRowNo = columnIndex === 0;
                        const isHoveredRow = hoveredCell.row === rowIndex;

                        return CellRenderer({
                          rowIndex,
                          columnIndex,
                          isLoaded: !!records[rowIndex],
                          value: columnIndex === 0
                            ? rowIndex + 1
                            : records[rowIndex][field.name],
                          setHoveredCell,
                          isHoveredRow,
                          field,
                          isRowNo,
                          isForeignKey: !isRowNo && field
                            ? connectionFields.includes(field.name)
                            : false,
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
  height: PropTypes.number.isRequired,
  table: ITable.isRequired,
  tables: PropTypes.arrayOf(ITable),
};
