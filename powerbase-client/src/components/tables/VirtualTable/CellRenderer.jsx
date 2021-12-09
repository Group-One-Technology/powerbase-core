/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { ArrowsExpandIcon } from '@heroicons/react/outline';
import { FieldType } from '@lib/constants/field-types';
import { formatDate } from '@lib/helpers/formatDate';
import { formatCurrency } from '@lib/helpers/formatCurrency';
import { isValidHttpUrl } from '@lib/helpers/isValidHttpUrl';
import { isValidEmail } from '@lib/helpers/isValidEmail';
import { isValidJSONString } from '@lib/helpers/isValidJSONString';
import { initializeFields } from '@lib/helpers/fields/initializeFields';
import { OutsideCellClick } from '@components/ui/OutsideCellClick';
import { useEditingCell } from '@lib/hooks/useEditingCell';
import EditCell from './EditCell';

function CellValue({
  value,
  isLoaded,
  isRowNo,
  isHoveredRow,
  isLastRow,
  field,
  fieldType,
  handleExpandRecord,
  changeBool,
}) {
  const className = value?.toString().length && field?.isForeignKey
    ? 'px-2 py-0.25 bg-blue-50 rounded'
    : '';

  if (!isLastRow && !isLoaded) {
    return <span className="h-5 bg-gray-200 rounded w-full animate-pulse" />;
  }

  if (isRowNo || !field) {
    return (
      <>
        <span className="flex-1 mr-4 text-right truncate">
          {value?.toString()}
        </span>
        <span className="flex-1">
          {isHoveredRow && !isLastRow && (
            <button
              type="button"
              className="inline-flex items-center p-0.5 border border-transparent rounded-full text-indigo-600 hover:bg-indigo-100 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-indigo-100"
              onClick={() => {
                if (handleExpandRecord) {
                  handleExpandRecord(value);
                }
              }}
            >
              <ArrowsExpandIcon className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Expand Record</span>
            </button>
          )}{' '}
        </span>
      </>
    );
  }

  if (field.isPii) {
    return <span>*****</span>;
  }

  if (fieldType?.name === FieldType.CHECKBOX && !field.isPii) {
    return (
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        checked={value?.toString() === 'true'}
        readOnly
      />
    );
  }

  if (fieldType?.name === FieldType.DATE && !field.isPii) {
    const date = formatDate(value);

    return <span className={className}>{date ? `${date} UTC` : null}</span>;
  }

  if (fieldType?.name === FieldType.JSON_TEXT && isValidJSONString(value)) {
    return <span className={className}>{'{}'}</span>;
  }

  if (fieldType?.name === FieldType.EMAIL && isValidEmail(value)) {
    return (
      <a
        href={`mailto:${value.toString()}`}
        className={cn('underline text-gray-500', className)}
      >
        {value.toString()}
      </a>
    );
  }

  if (fieldType?.name === FieldType.URL && isValidHttpUrl(value)) {
    return (
      <a
        href={value.toString()}
        target="_blank"
        rel="noreferrer"
        className={cn('underline text-gray-500', className)}
      >
        {value.toString()}
      </a>
    );
  }

  if (fieldType?.name === FieldType.CURRENCY) {
    const currency = formatCurrency(value, field?.options);

    return <span className={className}>{currency}</span>;
  }

  return (
    <span
      className={cn(
        value?.toString().length
          && field.isForeignKey
          && 'px-2 py-0.25 bg-blue-50 rounded',
      )}
    >
      {value?.toString()}
      {fieldType?.name === FieldType.PERCENT && '%'}
    </span>
  );
}

CellValue.propTypes = {
  value: PropTypes.any,
  isLoaded: PropTypes.bool.isRequired,
  isRowNo: PropTypes.bool.isRequired,
  isHoveredRow: PropTypes.bool.isRequired,
  isLastRow: PropTypes.bool.isRequired,
  field: PropTypes.object,
  fieldType: PropTypes.object,
  handleExpandRecord: PropTypes.func,
  changeBool: PropTypes.func,
};

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
  editCellInput,
  setEditCellInput,
  records,
  validationToolTip,
  table,
  isNewRecord,
  setIsNewRecord,
  initialFields,
  connections,
  setUpdatedRecords,
  updatedRecords,
  isHighlighted,
  setCalendarValue,
  calendarValue,
  isTurbo,
  canAddRecords,
  catchError,
}) {
  const fieldType = field?.fieldTypeId
    ? fieldTypes?.find(
      (item) => item.id.toString() === field.fieldTypeId.toString(),
    )
    : undefined;

  const handleMouseEnter = () => {
    setHoveredCell({
      row: rowIndex,
      column: columnIndex,
    });
  };

  const handleMouseLeave = () => {
    setHoveredCell({});
  };
  const { onChange, onClickOutsideEditingCell } = useEditingCell(field, fieldType, setEditCellInput, setCellToEdit, setUpdatedRecords, setIsEditing, recordInputRef, editCellInput,
    rowIndex, initialFields, initializeFields, connections, records, isTurbo, updatedRecords, setIsNewRecord, catchError);
  const changeBool = () => {
    onClickOutsideEditingCell();
  };
  const Wrapper = ({ children, condition, wrapper }) => (condition ? wrapper(children) : children);

  const isDoubleClickedCell = cellToEdit
    && cellToEdit.row !== null
    && cellToEdit.row === rowIndex
    && cellToEdit.column === columnIndex;

  return (
    <div
      role="button"
      id={`row-${rowIndex}_col-${columnIndex}`}
      key={key}
      className={cn(
        'single-line text-sm truncate focus:bg-gray-100 border-b items-center py-1 px-2',
        isHighlighted && 'update-highlight',
        isHoveredRow && 'bg-gray-50',
        isRowNo ? 'justify-center text-xs text-gray-500' : 'border-r',
        !isRowNo && fieldType?.name !== FieldType.CHECKBOX ? 'inline' : 'flex',
        isDoubleClickedCell && 'border border-indigo-500',
        !isDoubleClickedCell && 'border-gray-200',
      )}
      style={style}
      tabIndex={0}
      onKeyDown={(evt) => {
        const el = evt.target;

        if (evt.code === 'Enter' && !isRowNo) {
          el.contentEditable = el.contentEditable !== 'true';
          if (isEditing && cellToEdit) onClickOutsideEditingCell();
        }
      }}
      onDoubleClick={() => {
        if (!isRowNo && canAddRecords && !isLastRow && fieldType.dataType.toLowerCase() !== 'boolean') {
          setIsEditing(true);
          setEditCellInput(value);
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
      {isEditing
      && rowIndex === cellToEdit?.row
      && columnIndex === cellToEdit?.column ? (
        <Wrapper
          condition={fieldType.dataType !== 'date'}
          wrapper={(children) => (
            <OutsideCellClick
              onClickOutside={() => onClickOutsideEditingCell()}
              className="h-full"
              isCalender={fieldType.dataType === 'date'}
            >
              {children}
            </OutsideCellClick>
          )}
        >
          <EditCell
            value={editCellInput}
            isEditing={isEditing}
            ref={recordInputRef}
            onChange={onChange}
            validationToolTip={validationToolTip}
            cellToEdit={cellToEdit}
            fieldType={fieldType}
            setCalendarValue={setCalendarValue}
            calendarValue={calendarValue}
            onClickOutsideEditingCell={onClickOutsideEditingCell}
          />
        </Wrapper>
        ) : (
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
            setEditCellInput={setEditCellInput}
            setCellToEdit={setCellToEdit}
            isNewRecord={isNewRecord}
            setIsNewRecord={setIsNewRecord}
            setHoveredCell={setHoveredCell}
            records={records}
            changeBool={changeBool}
          />
        )}
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
  editCellInput: PropTypes.string,
  setEditCellInput: PropTypes.func.isRequired,
  records: PropTypes.array.isRequired,
  validationToolTip: PropTypes.bool,
  table: PropTypes.object.isRequired,
  isNewRecord: PropTypes.bool,
  setIsNewRecord: PropTypes.func.isRequired,
  initialFields: PropTypes.array.isRequired,
  connections: PropTypes.array.isRequired,
  setUpdatedRecords: PropTypes.func.isRequired,
  updatedRecords: PropTypes.array.isRequired,
  setCalendarValue: PropTypes.func.isRequired,
  calendarValue: PropTypes.string,
  isTurbo: PropTypes.bool.isRequired,
  canAddRecords: PropTypes.bool.isRequired,
  catchError: PropTypes.func,
};
