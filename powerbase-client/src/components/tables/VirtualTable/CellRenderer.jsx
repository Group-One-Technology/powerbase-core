import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import { FieldType } from '@lib/constants/field-types';
import { OutsideCellClick } from '@components/ui/OutsideCellClick';
import { Wrapper } from '@components/ui/Wrappper';
import { EditCell } from './GridCell/EditCell';
import { CellMenu } from './GridCell/CellMenu';
import { CellValue } from './GridCell/CellValue';
import { CellInput } from './GridCell/CellInput';

export function CellRenderer({
  key,
  columnIndex,
  rowIndex,
  isLoaded,
  style,
  value,
  field,
  setHoveredCell,
  isHoveredRow,
  isLastRow,
  isRowNo,
  fieldTypes,
  handleExpandRecord,
  recordInputRef,
  isEditing,
  setIsEditing,
  cellToEdit,
  setCellToEdit,
  records,
  setRecords,
  table,
  isAddRecord,
  isHighlighted,
  isEditable,
  handleExitEditing,
  handleValueChange,
  showAddRecord,
  handleAddRecord,
}) {
  const fieldType = field?.fieldTypeId
    ? fieldTypes?.find(
      (item) => item.id.toString() === field.fieldTypeId.toString(),
    )
    : undefined;
  const isEditableCell = cellToEdit
      && cellToEdit.row !== null
      && cellToEdit.row === rowIndex
      && cellToEdit.column === columnIndex;
  const className = cn(
    'single-line text-sm truncate focus:bg-gray-100 items-center py-1 px-2 border-r border-b border-gray-200',
    isHighlighted && 'update-highlight',
    isHoveredRow && 'bg-gray-50',
    (isLastRow && isAddRecord) && 'bg-green-50',
    isRowNo && 'justify-center text-xs text-gray-500',
    (!isRowNo && fieldType?.name !== FieldType.CHECKBOX) ? 'inline' : 'flex',
  );

  const onExitEditing = (updatedValue) => handleExitEditing({
    rowIndex,
    field,
    fieldType,
    updatedValue,
  });

  const handleMouseEnter = () => {
    setHoveredCell({ row: rowIndex, column: columnIndex });
    if (fieldType?.dataType === 'boolean') {
      setCellToEdit({ row: rowIndex, column: columnIndex });
    }
  };

  const handleMouseLeave = () => {
    setHoveredCell({});
    if (fieldType?.dataType === 'boolean') {
      setCellToEdit({});
    }
  };

  if (isAddRecord && isLastRow && !isRowNo) {
    return (
      <div
        key={key}
        className={cn(
          'overflow-hidden border-r border-b border-gray-200',
          fieldType.name !== FieldType.CHECKBOX && 'focus-within:border-2 focus-within:border-indigo-500',
        )}
        style={style}
      >
        <CellInput
          value={value}
          field={field}
          fieldType={fieldType}
          onValueChange={handleValueChange}
          style={style}
          isAddRecord
        />
      </div>
    );
  }

  if (isEditing && isEditableCell) {
    const condition = fieldType.dataType !== 'date';
    const editCellClassName = 'border-2 border-indigo-500 overflow-hidden';

    return (
      <Wrapper
        key={key}
        condition={condition}
        wrapper={(children) => (
          <OutsideCellClick
            style={style}
            onClickOutside={onExitEditing}
            className={editCellClassName}
          >
            {children}
          </OutsideCellClick>
        )}
      >
        <EditCell
          key={key}
          ref={recordInputRef}
          value={value}
          isEditing={isEditing}
          field={field}
          fieldType={fieldType}
          handleExitCell={onExitEditing}
          style={!condition ? style : undefined}
          className={cn(!condition && editCellClassName)}
        />
      </Wrapper>
    );
  }

  return (
    <div
      role="button"
      id={`row-${rowIndex}_col-${columnIndex}`}
      key={key}
      className={className}
      style={style}
      tabIndex={0}
      onDoubleClick={() => {
        const isExcludedFromDoubleClickAction = fieldType?.dataType.toLowerCase() === 'boolean'
          || fieldType?.dataType.toLowerCase() === 'date'
          || field?.isPrimaryKey
          || field?.isForeignKey;

        if (isEditable && !isExcludedFromDoubleClickAction) {
          setIsEditing(true);
          setHoveredCell({});
          setCellToEdit({
            row: rowIndex,
            column: columnIndex,
          });
        }
      }}
      onBlur={(evt) => {
        if (!isRowNo) evt.target.contentEditable = false;
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      suppressContentEditableWarning
    >
      <CellMenu
        table={table}
        rowIndex={rowIndex}
        records={records}
        setRecords={setRecords}
      >
        <CellValue
          value={value}
          isLoaded={isLoaded}
          isRowNo={isRowNo}
          isHoveredRow={isHoveredRow}
          isLastRow={isLastRow}
          field={field}
          fieldType={fieldType}
          handleExpandRecord={handleExpandRecord}
          table={table}
          rowIndex={rowIndex}
          columnIndex={columnIndex}
          setIsEditing={setIsEditing}
          setCellToEdit={setCellToEdit}
          isAddRecord={isAddRecord}
          setHoveredCell={setHoveredCell}
          records={records}
          handleChange={(updatedValue) => onExitEditing(updatedValue)}
          showAddRecord={showAddRecord}
          handleAddRecord={handleAddRecord}
        />
      </CellMenu>
    </div>
  );
}

CellRenderer.propTypes = {
  key: PropTypes.number.isRequired,
  rowIndex: PropTypes.number.isRequired,
  columnIndex: PropTypes.number.isRequired,
  isLoaded: PropTypes.bool.isRequired,
  style: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
  field: PropTypes.object,
  setHoveredCell: PropTypes.func.isRequired,
  isHoveredRow: PropTypes.bool.isRequired,
  isLastRow: PropTypes.bool.isRequired,
  isRowNo: PropTypes.bool.isRequired,
  fieldTypes: PropTypes.array.isRequired,
  handleExpandRecord: PropTypes.func,
  isHighlighted: PropTypes.bool,
  recordInputRef: PropTypes.func,
  isEditing: PropTypes.bool,
  setIsEditing: PropTypes.func.isRequired,
  cellToEdit: PropTypes.object,
  setCellToEdit: PropTypes.func.isRequired,
  records: PropTypes.array.isRequired,
  setRecords: PropTypes.func.isRequired,
  table: PropTypes.object.isRequired,
  isAddRecord: PropTypes.bool,
  isEditable: PropTypes.bool,
  handleExitEditing: PropTypes.func.isRequired,
  handleValueChange: PropTypes.func.isRequired,
  showAddRecord: PropTypes.func.isRequired,
  handleAddRecord: PropTypes.func.isRequired,
};
