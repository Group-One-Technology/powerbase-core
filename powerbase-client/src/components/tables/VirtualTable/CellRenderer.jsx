import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import { FieldType } from '@lib/constants/field-types';
import { CellValue } from './GridCell/CellValue';
import { CellInput } from './GridCell/CellInput';
import { CellMenu } from './GridCell/CellMenu';

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
  fieldType,
  handleExpandRecord,
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
  catchError,
}) {
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

  const hasFocusEditHighlight = fieldType != null
    && ![FieldType.CHECKBOX, FieldType.LONG_TEXT, FieldType.JSON_TEXT].includes(fieldType.name);

  const onExitEditing = (updatedValue) => handleExitEditing({
    rowIndex,
    field,
    fieldType,
    updatedValue,
  });

  const handleEditCell = () => {
    if (!isEditable) {
      if (field.isPrimaryKey || field.isPii || fieldType.name === FieldType.JSON_TEXT) {
        if (field.isPrimaryKey) {
          catchError('Cannot update a primary key field.');
        } else if (field.isPii) {
          catchError('Cannot update a PII field. You can update it in the record modal instead if you have the permission.');
        } else if (fieldType.name === FieldType.JSON_TEXT) {
          catchError('Cannot update a JSON Text field. You can update it in the record modal instead if you have the permission.');
        }
        return;
      }
    }

    setIsEditing(true);
    setHoveredCell({});
    setCellToEdit({ row: rowIndex, column: columnIndex });
  };

  if (isAddRecord && isLastRow && !isRowNo) {
    return (
      <div
        key={key}
        className={cn(
          'overflow-hidden border-r border-b border-gray-200',
          hasFocusEditHighlight && 'focus-within:border-2 focus-within:border-indigo-500',
        )}
        style={style}
      >
        <CellInput
          value={value}
          field={field}
          fieldType={fieldType}
          onValueChange={handleValueChange}
          style={style}
          validate={field.hasValidation}
          isAddRecord
        />
      </div>
    );
  }

  if (isEditing && isEditableCell) {
    return (
      <div
        key={key}
        className={cn(
          'overflow-hidden border-r border-b border-gray-200',
          hasFocusEditHighlight && 'focus-within:border-2 focus-within:border-indigo-500',
        )}
        style={style}
      >
        <CellInput
          value={value}
          field={field}
          fieldType={fieldType}
          onSubmit={(initialValue, updatedValue) => {
            setIsEditing(false);
            setCellToEdit({});
            if (initialValue !== updatedValue) {
              onExitEditing(updatedValue);
            }
          }}
          style={style}
          validate={field.hasValidation}
        />
      </div>
    );
  }

  return (
    <CellMenu
      key={key}
      table={table}
      rowIndex={rowIndex}
      columnIndex={columnIndex}
      records={records}
      setRecords={setRecords}
      setHoveredCell={setHoveredCell}
      onEditCell={handleEditCell}
      className={className}
      style={style}
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
  fieldType: PropTypes.object,
  handleExpandRecord: PropTypes.func,
  isHighlighted: PropTypes.bool,
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
  catchError: PropTypes.func.isRequired,
};
