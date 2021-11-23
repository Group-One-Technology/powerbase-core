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

const camelToSnakeCase = (str) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

function caseInsensitivelyAccessProp(obj, prop) {
  prop = (prop + "").toLowerCase();
  for (var p in obj) {
    if (obj.hasOwnProperty(p) && prop == (p + "").toLowerCase()) {
      return obj[p];
    } else return false;
  }
}

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
          {/* {isHoveredRow && isLastRow && isRowNo && (
            <button
              type="button"
              className="inline-flex items-center p-0.5 border border-transparent rounded-full text-indigo-600 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-indigo-100"
              onClick={addNewRecord}
            >
              <PlusIcon className="h-5 w-5 ml-2 p-0.5" />
              <span className="sr-only">Add New Record</span>
            </button>
          )} */}
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
  singleCellRef,
  mutateTableRecords,
  table,
  isNewRecord,
  setIsNewRecord,
  initialFields,
  connections,
  setUpdatedRecords,
  updatedRecords,
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

  const validateEmail = (email) => {
    const pattern =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return pattern.test(email);
  };

  const onChange = (e) => {
    setEditCellInput(e.target.value);
    if (field?.fieldTypeId === 8) {
      if (validateEmail(e.target.value)) setValidationToolTip(false);
      else setValidationToolTip(true);
    }
  };

  const determineCellValueKey = (field) => {
    const { fieldTypeId, precision } = field;
    switch (fieldTypeId) {
      case 1:
      case 8:
        return "string_value";
      case 2:
        return "text_value";
      case 4:
        if (precision) return "decimal_value";
        else return "integer_value";
      default:
        // console.log("Unknown field type");
        return;
    }
  };

  const onClickOutsideEditingCell = async () => {
    let num, newRecordId;
    const key = determineCellValueKey(field);
    if (field.fieldTypeId === 4 && field.precision && !field.allowDirtyValue) {
      const value = recordInputRef.current?.value;
      num = parseInt(value).toFixed(field.precision);
    }

    // setCellToEdit({});

    if (table.isVirtual && isNewRecord) {
      const recordParams = {
        powerbase_table_id: table.id,
        powerbase_database_id: table.databaseId,
        powerbase_record_order: records.length,
      };
      const newRecordResponse = await securedApi.post(
        `/magic_records`,
        recordParams
      );
      newRecordId = newRecordResponse.data?.id;
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

    let primaryKeys = {};
    let primaryKeyProp;
    let primaryKeyValue;
    computedFields?.forEach((item) => {
      const { isPrimaryKey, value, name } = item;
      if (isPrimaryKey) {
        primaryKeyProp = name;
        primaryKeys[name.toLowerCase()] = value;
        primaryKeyValue = value;
      }
    });

    const payload = {
      primary_keys: primaryKeys,
      data: { [field.name]: recordInputRef.current?.value },
    };

    console.log(payload);

    // const response = await securedApi.post(
    //   `/magic_values/${field.tableId}`,
    //   payload
    // );

    // mutateTableRecords();

    // const updatedRecord = response.data;
    // const recordsToUse = updatedRecords ? updatedRecords : records;

    // const mutatedRecords = records.map((recordObj) => {
    //   console.log(recordObj);
    //   const accessedValue = caseInsensitivelyAccessProp(
    //     recordObj,
    //     primaryKeyProp
    //   );
    //   if (accessedValue === primaryKeyValue) {
    //     let newObj = {};
    //     Object.keys(recordObj).forEach((key) => {
    //       Object.keys(updatedRecord).forEach((updatedKey) => {
    //         console.log(key, updatedKey);
    //         if (key.toLowerCase() === updatedKey.toLowerCase()) {
    //           newObj[key] = updatedRecord[updatedKey];
    //         }
    //       });
    //     });
    //     console.log(newObj);
    //     return newObj;
    //   } else return recordObj;
    // });

    // console.log(mutatedRecords);

    // setUpdatedRecords(mutatedRecords);
    // mutateTableRecords();

    // if (response.statusText === "OK") {
    //   setIsNewRecord(false);
    //   setCellToEdit({});
    //   recordInputRef?.current?.blur();
    //   setIsEditing(false);
    // }
  };

  return (
    <div
      role="button"
      id={`row-${rowIndex}_col-${columnIndex}`}
      key={key}
      className={cn(
        "single-line text-sm truncate focus:bg-gray-100 border-b border-gray-200 items-center py-1 px-2",
        isHoveredRow && "bg-gray-50",
        isRowNo ? "justify-center text-xs text-gray-500" : "border-r",
        !isRowNo && fieldType?.name !== FieldType.CHECKBOX ? "inline" : "flex",
        cellToEdit &&
          cellToEdit.row !== null &&
          cellToEdit.row === rowIndex &&
          cellToEdit.column === columnIndex &&
          "border border-indigo-500"
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
        if (!isRowNo) {
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
        <OutsideCellClick
          onClickOutside={onClickOutsideEditingCell}
          className="h-full"
        >
          <EditCell
            value={editCellInput}
            isEditing={isEditing}
            ref={recordInputRef}
            onChange={onChange}
            validationToolTip={validationToolTip}
            cellToEdit={cellToEdit}
          />
        </OutsideCellClick>
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
};
