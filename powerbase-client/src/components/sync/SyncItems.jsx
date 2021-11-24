/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useFieldTypes } from "@models/FieldTypes";
import { FieldTypeIcon } from "@components/ui/FieldTypeIcon";

export default function SyncItems({ fields }) {
  const { data: fieldTypes } = useFieldTypes();
  const [filteredFields, setFilteredFields] = useState();
  useEffect(() => {
    setFilteredFields(fields.filter((field) => field.isVirtual));
  }, []);
  return (
    <fieldset className="px-3">
      <div className="flex justify-between">
        <legend className="text-sm font-semibold text-gray-800">Fields</legend>
        <div className="relative flex items-start">
          <div className="text-sm">
            <label htmlFor="comments" className="text-indigo-500">
              Select all
            </label>
          </div>
          <div className="flex items-center h-5 ml-2">
            <input
              id="comments"
              aria-describedby="comments-description"
              name="comments"
              type="checkbox"
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
      <div className="mt-4 border-t border-b border-gray-200 divide-y divide-gray-200">
        {filteredFields?.map((field, fieldIdx) => (
          <div key={fieldIdx} className="relative flex items-start py-3">
            <div className="min-w-0 flex-1 text-xs">
              <label
                htmlFor={`field-${field.id}`}
                className="flex text-sm text-gray-700 select-none px-2"
              >
                <div className="flex items-center pointer-events-none">
                  <FieldTypeIcon
                    isPrimaryKey={field.isPrimaryKey}
                    typeId={field.fieldTypeId}
                    fieldTypes={fieldTypes}
                  />
                </div>
                <span className="ml-3 font-medium">
                  {field.alias || field.name}{" "}
                </span>
              </label>
            </div>
            <div className="ml-3 flex items-center h-5">
              <input
                id={`field-${field.id}`}
                name={`field-${field.id}`}
                type="checkbox"
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
