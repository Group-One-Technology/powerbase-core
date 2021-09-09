import React, { useState, useRef, useEffect } from 'react';
import {
  Grid, InfiniteLoader, AutoSizer,
} from 'react-virtualized';
import PropTypes from 'prop-types';

import { IViewField } from '@lib/propTypes/view-field';
import { ITable } from '@lib/propTypes/table';
import { SingleRecordModal } from '@components/record/SingleRecordModal';
import { useDidMountEffect } from '@lib/hooks/useDidMountEffect';
import { CellRenderer } from './CellRenderer';

const ROW_NO_CELL_WIDTH = 80;

export function TableRenderer({
  remoteFields,
  records,
  totalRecords,
  loadMoreRows,
  isLoading,
  height,
  tables,
  foreignKeys,
  fieldTypes,
  mutateViewFields,
}) {
  const [fields, setFields] = useState([]);
  const columnCount = remoteFields && remoteFields.length + 1;
  const rowCount = remoteFields && records.length + 1;
  const fieldNames = remoteFields.map((field) => field.name);
  const tableValues = [['', ...fieldNames], ...records];
  const foreignKeyIndices = foreignKeys
    .map((item) => item.columns)
    .flat()
    .map((item) => fieldNames.indexOf(item) + 1);

  const [hoveredCell, setHoveredCell] = useState({ row: null, column: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState();
  const [colResized, setColResized] = useState();
  const isRowLoaded = ({ index }) => !!tableValues[index];

  const gridRef = useRef(null);

  useEffect(() => {
    setFields(remoteFields);
  }, [remoteFields]);

  useDidMountEffect(() => {
    if (gridRef.current) {
      gridRef.current.forceUpdate();
      gridRef.current.recomputeGridSize();
    }
  }, [fields]);

  const handleResizeCol = (columnIndex, deltaX) => {
    const updatedColumns = fields.map((col, index) => {
      if (columnIndex === index) {
        setColResized(col);
        return {
          ...col,
          width: Math.max(col.width + deltaX, 10),
          resized: true,
        };
      }
      return { ...col };
    });
    setFields(updatedColumns);
  };

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
    setSelectedRecord(
      fields.map((item, index) => {
        const foreignKey = foreignKeyIndices.includes(index + 1)
          ? foreignKeys.find((key) => key.columns.includes(item.name))
          : undefined;

        return {
          ...item,
          value: tableValues[rowNo][index + 1],
          isForeignKey: !!foreignKey,
          isCompositeKey: foreignKey?.columns.length > 1,
          foreignKey: foreignKey
            ? {
              ...foreignKey,
              columnIndex: foreignKey.columns.indexOf(item.name),
            }
            : undefined,
        };
      }),
    );
  };

  return (
    <div className="w-full overflow-hidden z-0">
      <InfiniteLoader
        isRowLoaded={isRowLoaded}
        loadMoreRows={handleLoadMoreRows}
        rowCount={totalRecords * columnCount}
      >
        {({ onRowsRendered, registerChild }) => (
          <AutoSizer
            disableHeight
            onResize={() => gridRef.current?.recomputeGridSize()}
          >
            {({ width }) => (
              <Grid
                ref={(instance) => {
                  if (instance) {
                    gridRef.current = instance;
                    registerChild(instance);
                  }
                }}
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
                  const isHeader = rowIndex === 0;
                  const isRowNo = columnIndex === 0 && rowIndex !== 0;
                  const isLastRecord = rowIndex >= tableValues.length - 1;
                  const isHoveredRow = hoveredCell.row === rowIndex;

                  return CellRenderer({
                    rowIndex,
                    columnIndex,
                    isLoaded: !!tableValues[rowIndex],
                    value: tableValues[rowIndex][columnIndex],
                    setHoveredCell,
                    isHeader,
                    isHoveredRow,
                    isRowNo,
                    isLastRecord,
                    handleResizeCol,
                    mutateViewFields,
                    remoteFields,
                    columnResized: colResized,
                    isForeignKey: foreignKeyIndices.includes(columnIndex),
                    fieldTypeId:
                      isHeader && columnIndex !== 0
                        ? remoteFields[columnIndex - 1].fieldTypeId
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
                    return fields[index - 1]?.width;
                  }
                  return 300;
                }}
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
      {selectedRecord && (
        <SingleRecordModal
          open={isModalOpen}
          setOpen={setIsModalOpen}
          record={selectedRecord}
          tables={tables}
          foreignKeys={foreignKeys}
          fieldTypes={fieldTypes}
        />
      )}
    </div>
  );
}

TableRenderer.propTypes = {
  remoteFields: PropTypes.arrayOf(IViewField).isRequired,
  records: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.any)).isRequired,
  totalRecords: PropTypes.number,
  loadMoreRows: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  height: PropTypes.number.isRequired,
  foreignKeys: PropTypes.array,
  tables: PropTypes.arrayOf(ITable),
  fieldTypes: PropTypes.array.isRequired,
  mutateViewFields: PropTypes.func,
};
