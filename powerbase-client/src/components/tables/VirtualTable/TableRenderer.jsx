/* eslint-disable operator-linebreak */
/* eslint-disable object-curly-newline */
/* eslint-disable  */
import React, { useState, useRef } from "react";
import { Grid, InfiniteLoader, AutoSizer, ScrollSync } from "react-virtualized";
import PropTypes from "prop-types";

import { useFieldTypes } from "@models/FieldTypes";
import { RecordsModalStateProvider } from "@models/record/RecordsModalState";
import { useTableRecords } from "@models/TableRecords";
import { useTableConnections } from "@models/TableConnections";
import { useTableRecordsCount } from "@models/TableRecordsCount";
import { useViewFieldState } from "@models/view/ViewFieldState";
import { ITable } from "@lib/propTypes/table";
import { useDidMountEffect } from "@lib/hooks/useDidMountEffect";
import { ROW_NO_CELL_WIDTH, DEFAULT_CELL_WIDTH } from "@lib/constants";
import { initializeFields } from "@lib/helpers/fields/initializeFields";
import { SingleRecordModal } from "@components/record/SingleRecordModal";
import { GridHeader } from "./GridHeader";
import { CellRenderer } from "./CellRenderer";
import { useBase } from "@models/Base";

export function TableRenderer({ height, table, highlightedCell, base }) {
  const { data: fieldTypes } = useFieldTypes();
  const { data: totalRecords } = useTableRecordsCount();
  const { data: connections } = useTableConnections();
  const {
    data: records,
    loadMore: loadMoreRows,
    isLoading,
    mutate: mutateTableRecords,
  } = useTableRecords();
  const { initialFields, fields, setFields } = useViewFieldState();

  const recordsGridRef = useRef(null);
  const headerGridRef = useRef(null);
  const recordInputRef = useRef();
  const singleCellRef = useRef();

  const [hoveredCell, setHoveredCell] = useState({ row: null, column: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState();
  const [isEditing, setIsEditing] = useState(false);
  const [cellToEdit, setCellToEdit] = useState({ row: null, column: null });
  const [editCellInput, setEditCellInput] = useState(null);
  const [validationToolTip, setValidationToolTip] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [updatedRecords, setUpdatedRecords] = useState();
  const [calendarValue, setCalendarValue] = useState();

  const columnCount = fields && fields.length + 1;

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
      !isLoading &&
      stop + 100 > records.length &&
      records.length - 1 !== totalRecords
    ) {
      loadMoreRows();
    }
  };

  const handleExpandRecord = (rowNo) => {
    const updatedFields = initializeFields(initialFields, connections, {
      hidden: false,
    })
      .map((item) => ({
        ...item,
        value: records[rowNo - 1][item.name],
      }))
      .sort((x, y) => x.order > y.order);

    setIsModalOpen(true);
    setSelectedRecord(updatedFields);
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
            {({ onScroll, scrollLeft, scrollHeight, clientHeight }) => (
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
                  base={base}
                />
                <InfiniteLoader
                  isRowLoaded={({ index }) => !!records[index]}
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
                        const startIndex =
                          rowStartIndex * columnCount + columnStartIndex;
                        const stopIndex =
                          rowStopIndex * columnCount + columnStopIndex;
                        return onRowsRendered({ startIndex, stopIndex });
                      }}
                      onRowsRendered={onRowsRendered}
                      cellRenderer={({ rowIndex, columnIndex, ...props }) => {
                        const field = fields[columnIndex - 1];
                        const isRowNo = columnIndex === 0;
                        const isHoveredRow = hoveredCell.row === rowIndex;
                        const isHighlighted =
                          records[rowIndex]?.doc_id === highlightedCell;
                        const isLastRow = rowIndex >= records.length;
                        const recordsToUse = updatedRecords || records;
                        let value =
                          columnIndex !== 0 && !isLastRow
                            ? recordsToUse[rowIndex][field.name]
                            : null;
                        if (columnIndex === 0) {
                          value = rowIndex + 1;
                        }

                        return CellRenderer({
                          rowIndex,
                          columnIndex,
                          isHighlighted,
                          isLastRow,
                          isLoaded: !!records[rowIndex],
                          value,
                          setHoveredCell,
                          isHoveredRow,
                          field,
                          isRowNo,
                          fieldTypes,
                          handleExpandRecord: isRowNo
                            ? handleExpandRecord
                            : undefined,
                          recordInputRef,
                          isEditing,
                          setIsEditing,
                          cellToEdit,
                          setCellToEdit,
                          editCellInput,
                          setEditCellInput,
                          records,
                          validationToolTip,
                          setValidationToolTip,
                          singleCellRef,
                          mutateTableRecords,
                          table,
                          isNewRecord,
                          setIsNewRecord,
                          connections,
                          initialFields,
                          setUpdatedRecords,
                          updatedRecords,
                          calendarValue,
                          setCalendarValue,
                          isTurbo: base.isTurbo,
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
                      rowCount={records.length + 1}
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
        <RecordsModalStateProvider rootRecord={selectedRecord}>
          <SingleRecordModal
            table={table}
            open={isModalOpen}
            setOpen={setIsModalOpen}
            record={selectedRecord}
          />
        </RecordsModalStateProvider>
      )}
    </div>
  );
}

TableRenderer.propTypes = {
  height: PropTypes.number.isRequired,
  table: ITable.isRequired,
  highlightedCell: PropTypes.string,
};
