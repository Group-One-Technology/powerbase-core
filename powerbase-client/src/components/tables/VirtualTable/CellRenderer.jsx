/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import cn from "classnames";
import { ArrowsExpandIcon } from "@heroicons/react/outline";
import { FieldType } from "@lib/constants/field-types";
import { formatDate } from "@lib/helpers/formatDate";
import { formatCurrency } from "@lib/helpers/formatCurrency";
import { isValidHttpUrl } from "@lib/helpers/isValidHttpUrl";
import { isValidEmail } from "@lib/helpers/isValidEmail";
import { isValidJSONString } from "@lib/helpers/isValidJSONString";
import OutsideCellClick from "./OutsideCellClick.jsx";
import EditCell from "./EditCell.jsx";
import { securedApi } from "@lib/api";
import { PlusIcon } from "@heroicons/react/solid";
import { initializeFields } from "@lib/helpers/fields/initializeFields";
import {
  isValidInteger,
  isValidNumberOrDecimal,
  formatToDecimalPlaces,
} from "@lib/helpers/numbers";

function CellValue({
  value,
  isLoaded,
  isRowNo,
  isHoveredRow,
  isLastRow,
  field,
  fieldType,
  handleExpandRecord,
  table,
  rowIndex,
  columnIndex,
  setIsEditing,
  setEditCellInput,
  setCellToEdit,
  setIsNewRecord,
  setHoveredCell,
  records,
}) {
  const className =
    value?.toString().length && field?.isForeignKey
      ? "px-2 py-0.25 bg-blue-50 rounded"
      : "";

  const addNewRecord = () => {
    setIsEditing(true);
    setEditCellInput("");
    setCellToEdit({
      row: rowIndex,
      column: columnIndex + 1,
    });
    setIsNewRecord(true);
    setHoveredCell({});
  };

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
          )}{" "}
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
        checked={value?.toString() === "true"}
        readOnly
      />
    );
  }

  if (fieldType?.name === FieldType.DATE && !field.isPii) {
    const date = formatDate(value);

    return <span className={className}>{date ? `${date} UTC` : null}</span>;
  }

  if (fieldType?.name === FieldType.JSON_TEXT && isValidJSONString(value)) {
    return <span className={className}>{"{}"}</span>;
  }

  if (fieldType?.name === FieldType.EMAIL && isValidEmail(value)) {
    return (
      <a
        href={`mailto:${value.toString()}`}
        className={cn("underline text-gray-500", className)}
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
        className={cn("underline text-gray-500", className)}
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
        value?.toString().length &&
          field.isForeignKey &&
          "px-2 py-0.25 bg-blue-50 rounded"
      )}
    >
      {value?.toString()}
      {fieldType?.name === FieldType.PERCENT && "%"}
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
  setValidationToolTip,
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
}) {
  const fieldType = field?.fieldTypeId
    ? fieldTypes?.find(
        (item) => item.id.toString() === field.fieldTypeId.toString()
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

  const handleMagicInputValidation = (value) => {
    if (!value) return true;
    const type = fieldType.dataType;
    switch (type?.toLowerCase()) {
      case "string":
      case "text":
        return true;
      case "number":
        return field.precision
          ? isValidNumberOrDecimal(value)
          : isValidInteger(value);
      default:
        return true;
    }
  };

  const onChange = (e) => {
    let value = e.target.value;
    if (!handleMagicInputValidation(value)) return;
    setEditCellInput(value);
  };

  const onClickOutsideEditingCell = async (e, calendarData = null) => {
    const exitEditing = () => {
      setCellToEdit({});
      recordInputRef?.current?.blur();
      setIsEditing(false);
    };

    if (!editCellInput?.length && fieldType.dataType !== "date") {
      exitEditing();
      return;
    }
    const rowNo = rowIndex + 1;
    const updatedFields = initializeFields(initialFields, connections, {
      hidden: false,
    })
      .map((item) => ({
        ...item,
        value: records[rowNo - 1][item.name],
      }))
      .sort((x, y) => x.order > y.order);

    const computedFields = updatedFields.filter(
      (item) => !(item.isHidden || item.foreignKey?.columns.length > 1)
    );

    const primaryKeys = computedFields?.filter((item) => item.isPrimaryKey);

    const composedKeys = primaryKeys
      .map((key) => {
        const keyName = key.name.toLowerCase();
        const keyValue = (key.value + "").toLocaleLowerCase();
        return `${keyName}___${keyValue}`;
      })
      .join("---");

    let hasPrecision = false;
    let formattedNumber;
    let payload;
    if (field.precision && fieldType.dataType === "number") {
      hasPrecision = true;
      const sanitizedNumber = parseFloat(recordInputRef.current?.value);
      formattedNumber = formatToDecimalPlaces(sanitizedNumber, field.precision);
    }

    payload = {
      primary_keys: composedKeys,
      data: {
        [field.name]: field.precision
          ? formattedNumber
          : recordInputRef.current?.value,
      },
    };

    function getParameterCaseInsensitive(object, searchKey) {
      return object[
        Object.keys(object).find(
          (k) => k.toLowerCase() === searchKey.toLowerCase()
        )
      ];
    }

    try {
      const response = await securedApi.post(
        `/magic_values/${field.tableId}`,
        payload
      );
      const recordsToUse = updatedRecords ? updatedRecords : records;
      if (response.statusText === "OK") {
        const mutatedRecords = recordsToUse?.map((recordObj) => {
          let matches = [];
          const extractedPrimaryKeys = isTurbo
            ? primaryKeys
            : composedKeys.split("---");
          let objToUse = {};
          extractedPrimaryKeys.forEach((key, pkIdx) => {
            const sanitized = key.split("___");
            const pkName = isTurbo ? key.name : sanitized[0];
            const pkValue = isTurbo ? key.value : sanitized[1];
            matches.push(
              getParameterCaseInsensitive(recordObj, pkName) + "" ===
                pkValue + ""
            );
            if (pkIdx === extractedPrimaryKeys.length - 1) {
              if (!matches.includes(false)) {
                let newObj = { ...recordObj };
                newObj[field.name] =
                  hasPrecision && formattedNumber
                    ? formattedNumber
                    : calendarData
                    ? calendarData
                    : recordInputRef.current?.value;
                objToUse = newObj;
              } else {
                objToUse = recordObj;
              }
            }
          });
          return objToUse;
        });
        setUpdatedRecords(mutatedRecords);
        setIsNewRecord(false);
        exitEditing();
      }
    } catch (error) {
      exitEditing();
      console.log(error);
    }
  };

  const Wrapper = ({ children, condition, wrapper }) => {
    return condition ? wrapper(children) : children;
  };

  const isDoubleClickedCell =
    cellToEdit &&
    cellToEdit.row !== null &&
    cellToEdit.row === rowIndex &&
    cellToEdit.column === columnIndex;

  return (
    <div
      role="button"
      id={`row-${rowIndex}_col-${columnIndex}`}
      key={key}
      className={cn(
        "single-line text-sm truncate focus:bg-gray-100 border-b items-center py-1 px-2",
        isHighlighted && "update-highlight",
        isHoveredRow && "bg-gray-50",
        isRowNo ? "justify-center text-xs text-gray-500" : "border-r",
        !isRowNo && fieldType?.name !== FieldType.CHECKBOX ? "inline" : "flex",
        isDoubleClickedCell && "border border-indigo-500",
        !isDoubleClickedCell && "border-gray-200"
      )}
      style={style}
      tabIndex={0}
      onKeyDown={(evt) => {
        const el = evt.target;

        if (evt.code === "Enter" && !isRowNo) {
          el.contentEditable = el.contentEditable !== "true";
          if (isEditing && cellToEdit) onClickOutsideEditingCell();
        }
      }}
      onDoubleClick={(evt) => {
        if (!isRowNo && field.isVirtual) {
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
      {isEditing &&
      rowIndex === cellToEdit?.row &&
      field?.isVirtual &&
      columnIndex === cellToEdit?.column ? (
        <Wrapper
          condition={fieldType.dataType !== "date"}
          wrapper={(children) => (
            <OutsideCellClick
              onClickOutside={(e) => onClickOutsideEditingCell(e)}
              className="h-full"
              isCalender={fieldType.dataType === "date"}
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
};
