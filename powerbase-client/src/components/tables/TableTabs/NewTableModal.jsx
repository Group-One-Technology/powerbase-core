/* eslint-disable */
import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon, PlusCircleIcon } from "@heroicons/react/outline";
import NewTableField from "./NewTableField";
import cn from "classnames";
import TableNameInput from "./TableNameInput";
import { securedApi } from "@lib/api";
import { useCurrentView } from "@models/views/CurrentTableView";

const toSnakeCase = (str) =>
  str &&
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((x) => x.toLowerCase())
    .join("_");

// const addNewField = async () => {
//   const payload = {
//     name: toSnakeCase(fieldName.toLowerCase()),
//     description: null,
//     oid: 1043,
//     db_type: selected.dbType,
//     default_value: "",
//     is_primary_key: false,
//     is_nullable: false,
//     powerbase_table_id: tableId,
//     powerbase_field_type_id: selected.id,
//     is_pii: false,
//     alias: fieldName,
//     view_id: view.id,
//     order: fields.length ? fields.length : 0,
//     is_virtual: true,
//     allow_dirty_value: isChecked,
//     precision: numberPrecision ? numberPrecision.precision : null,
//   };

//   const response = await securedApi.post(`/tables/${tableId}/field`, payload);
//   if (response.statusText === "OK") {
//     setIsCreatingField(false);
//     mutateViewFields();
//     return response.data;
//   }
// };

const initial = [
  {
    id: 1,
    fieldName: "",
    fieldTypeId: 1,
  },
];

const types = [];

export default function NewTableModal({ open, setOpen, table, tables, base }) {
  const [newFields, setNewFields] = useState(initial);
  const [currentCount, setCurrentCount] = useState(1);
  const [tableName, setTableName] = useState("");
  const { handleTableChange, mutateTables } = useCurrentView();

  const handleAddNewField = () => {
    setNewFields([
      ...newFields,
      { id: currentCount + 1, fieldName: "", fieldTypeId: 1 },
    ]);
    setCurrentCount(currentCount + 1);
  };

  const addTable = async () => {
    const standardizeFields = () => {
      const standardized = newFields.map((field, idx) => {
        const { fieldName, fieldTypeId } = field;
        return {
          name: toSnakeCase(fieldName.toLowerCase()),
          description: null,
          oid: 1043,
          db_type: "character varying",
          default_value: "",
          is_primary_key: false,
          is_nullable: false,
          powerbase_field_type_id: fieldTypeId,
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

    const standardizeTable = () => {
      return {
        name: toSnakeCase(tableName.toLowerCase()),
        description: null,
        powerbase_database_id: base.id,
        is_migrated: true,
        logs: null,
        is_virtual: true,
        page_size: 40,
        alias: tableName,
        order: tables.length,
      };
    };

    const payload = {
      table: standardizeTable(),
      fields: standardizeFields(),
    };

    console.log("PAYLOAD: ", payload);

    const response = await securedApi.post(`/tables/virtual_tables`, payload);
    if (response.data) {
      setOpen(false);
      mutateTables();
      handleTableChange({ table: response.data });
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={setOpen}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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
              <div className="px-2 mb-6">
                <p className="text-gray-600">TABLE</p>
                <TableNameInput
                  tableName={tableName}
                  setTableName={setTableName}
                />
              </div>
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

              <div className="mt-5 flex justify-end items-baseline">
                <button
                  type="button"
                  className="mr-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className={cn(
                    `inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-sm shadow-sm text-white bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`,
                    true && "hover:bg-indigo-700"
                  )}
                  onClick={addTable}
                >
                  Add Table
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
