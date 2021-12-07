/* eslint-disable */
import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusCircleIcon } from "@heroicons/react/outline";
import NewTableField from "./NewTableField";
import cn from "classnames";
import TableNameInput from "./TableNameInput";
import { securedApi } from "@lib/api";
import { useCurrentView } from "@models/views/CurrentTableView";
import Upload from "./UploadTable";
import { toSnakeCase, camelToSnakeCase, camelize } from "@lib/helpers/text/textTypeFormatters";

const initial = [
  {
    id: 1,
    fieldName: "",
    fieldTypeId: 1,
  },
];

const types = [];

export default function NewTableModal({
  open,
  setOpen,
  table,
  tables,
  base,
  isUploadAction,
}) {
  const [newFields, setNewFields] = useState(initial);
  const [currentCount, setCurrentCount] = useState(1);
  const [tableName, setTableName] = useState("");
  const { handleTableChange, mutateTables } = useCurrentView();
  const [csvArray, setCsvArray] = useState([]);
  const [csvFile, setCsvFile] = useState();

  const handleAddNewField = () => {
    setNewFields([
      ...newFields,
      { id: currentCount + 1, fieldName: "", fieldTypeId: 1 },
    ]);
    setCurrentCount(currentCount + 1);
  };

  const addTable = async () => {
    if (!isUploadAction) {
      const standardizeFields = () => {
        const standardized = newFields.map((field, idx) => {
          const { fieldName, fieldTypeId } = field;
          return {
            name: toSnakeCase(fieldName.toLowerCase()),
            description: null,
            oid: 1043,
            dbType: "character varying",
            defaultValue: "",
            isPrimaryKey: false,
            isNullable: false,
            powerbaseFieldTypeId: fieldTypeId,
            isPii: false,
            alias: fieldName,
            order: idx,
            isVirtual: true,
            allowDirtyValue: true,
            precision: null,
          };
        });
        return standardized;
      };

      const standardizeTable = () => {
        return {
          name: toSnakeCase(tableName.toLowerCase()),
          description: null,
          powerbaseDatabaseId: base.id,
          isMigrated: true,
          logs: null,
          isVirtual: true,
          pageSize: 40,
          alias: tableName,
          order: tables.length,
        };
      };

      const payload = {
        table: standardizeTable(),
        fields: standardizeFields(),
      };

      const data = await addVirtualTable({payload});
      if (data) {
        setOpen(false);
        mutateTables();
        handleTableChange({ table: data.table });
      }
    }

    if (isUploadAction) {
      const csvFieldNames = Object.getOwnPropertyNames(csvArray[0]);
      const standardizeTable = () => {
        return {
          name:
            csvFile?.name.split(".").slice(0, -1).join(".") +
            Math.floor(Math.random() * 10) +
            Math.floor(Math.random() * 10),
          description: null,
          powerbase_database_id: base.id,
          is_migrated: true,
          logs: null,
          is_virtual: true,
          page_size: 200,
          alias: tableName,
          order: tables.length,
        };
      };

      const standardizeFields = () => {
        const standardized = csvFieldNames.map((fieldName, idx) => {
          return {
            name: toSnakeCase(fieldName.toLowerCase()),
            description: null,
            oid: 1043,
            db_type: "character varying",
            default_value: "",
            is_primary_key: false,
            is_nullable: false,
            powerbase_field_type_id: 2,
            is_pii: false,
            alias: fieldName,
            order: idx,
            is_virtual: true,
            allow_dirty_value: true,
            precision: null,
          };
        });
        return standardized;
      };

      const payload = {
        table: standardizeTable(),
        fields: standardizeFields(),
      };

      const data = await await addVirtualTable({payload});
      if (data) {
        const newTable = response.data.table;
        const newFields = response.data.fields;
        csvArray.forEach(async (record, idx) => {
          let newRecordId;
          const recordParams = {
            powerbase_table_id: table.id,
            powerbase_database_id: table.databaseId,
            powerbase_record_order: idx,
          };
          // REFACTOR - to use api helper and camelcase prop names
          const newRecordResponse = await securedApi.post(
            `/magic_records`,
            recordParams
          );
          newRecordId = newRecordResponse.data?.id;
          if (newRecordId) {
            const recordKeys = Object.getOwnPropertyNames(record);
            recordKeys.forEach(async (key, keyIdx) => {
              const standardizedKey = key.replace(/^"(.*)"$/, "$1");
              const camelizedKey = camelize(standardizedKey);
              const payload = {
                field_name: camelToSnakeCase(camelizedKey),
                field_type_id: 2,
                table_id: newTable.id,
                field_id: newFields[camelizedKey],
                text_value: record[key],
                record_id: null,
                magic_record_id: newRecordId,
                key_type: "text_value",
                table_type_id: "magic_record_id",
                has_precision: false,
              };
              const response = await securedApi.post(`/magic_values`, payload);
              if (response.statusText === "OK") {
                if (
                  idx + 1 === csvArray.length &&
                  keyIdx + 1 === recordKeys.length
                ) {
                  // mutateTableRecords();
                  mutateTables();
                  handleTableChange({ table: newTable });
                }
              }
            });
          }
        });
      }
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={setOpen}
      >
        <form className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0" onSubmit={addTable}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
              {!isUploadAction && (
                <div className="px-2 mb-6">
                  <p className="text-gray-600">TABLE</p>
                  <TableNameInput
                    tableName={tableName}
                    setTableName={setTableName}
                  />
                </div>
              )}
              {!isUploadAction && (
                <div>
                  <p className="text-gray-600 px-2 mb-2">FIELDS</p>
                  {newFields?.map((field, index) => (
                    <NewTableField
                      key={index}
                      newFields={newFields}
                      newField={field}
                      count={index}
                      setNewFields={setNewFields}
                      id={field.id}
                    />
                  ))}
                </div>
              )}

              {!isUploadAction && (
                <div className="flex flex-row justify-center mt-2">
                  <p
                    className="flex flex-row cursor-pointer"
                    onClick={handleAddNewField}
                  >
                    <span className="flex-row">
                      <PlusCircleIcon className="text-indigo-400 w-6 h-6" />
                    </span>
                    <span className="text-sm text-indigo-400 ml-1 mt-0.5">
                      {" "}
                      Add a New Field{" "}
                    </span>
                  </p>
                </div>
              )}

              {isUploadAction && (
                <Upload
                  csvFile={csvFile}
                  setCsvFile={setCsvFile}
                  setCsvArray={setCsvArray}
                />
              )}

              <div className="mt-5 flex justify-end items-baseline">
                <button
                  type="button"
                  className="mr-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={cn(
                    `inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-sm shadow-sm text-white bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:bg-indigo-700`
                  )}
                >
                  Add Table
                </button>
              </div>
            </div>
          </Transition.Child>
        </form>
      </Dialog>
    </Transition.Root>
  );
}
