import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import { FieldType } from '@lib/constants/field-types';
import { OutsideCellClick } from '@components/ui/OutsideCellClick';
import { Wrapper } from '@components/ui/Wrappper';
import { EditCell } from './GridCell/EditCell';
import { CellValue } from './GridCell/CellValue';

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
  table,
  isNewRecord,
  setIsNewRecord,
  isHighlighted,
  isEditable,
  handleExitEditing,
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
    'single-line text-sm truncate focus:bg-gray-100 border-b items-center py-1 px-2 border border-gray-200',
    isHighlighted && 'update-highlight',
    isHoveredRow && 'bg-gray-50',
    isRowNo ? 'justify-center text-xs text-gray-500' : 'border-r',
    (!isRowNo && fieldType?.name !== FieldType.CHECKBOX) ? 'inline' : 'flex',
  );

  const onExitEditing = (updatedValue) => handleExitEditing({
    rowIndex,
    field,
    fieldType,
    updatedValue,
  });

  const handleMouseEnter = () => {
    setHoveredCell({
      row: rowIndex,
      column: columnIndex,
    });
    if (fieldType?.dataType === 'boolean') {
      setCellToEdit({
        row: rowIndex,
        column: columnIndex,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredCell({});
    if (fieldType?.dataType === 'boolean') {
      setCellToEdit({});
    }
  };

  if (isEditing && isEditableCell) {
    const condition = fieldType.dataType !== 'date';

    return (
      <Wrapper
        key={key}
        condition={condition}
        wrapper={(children) => (
          <OutsideCellClick
            style={style}
            onClickOutside={onExitEditing}
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
          style={!condition ? style : { width: style.width }}
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
        isNewRecord={isNewRecord}
        setIsNewRecord={setIsNewRecord}
        setHoveredCell={setHoveredCell}
        records={records}
        handleChange={(updatedValue) => onExitEditing(updatedValue)}
      />
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
  table: PropTypes.object.isRequired,
  isNewRecord: PropTypes.bool,
  setIsNewRecord: PropTypes.func.isRequired,
  isEditable: PropTypes.bool,
  handleExitEditing: PropTypes.func.isRequired,
};
