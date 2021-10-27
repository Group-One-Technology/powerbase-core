/* eslint-disable */
import React, { useState, useRef, useEffect } from "react";
import { securedApi } from "@lib/api";
import { RadioGroup } from "@headlessui/react";
import AwesomeDebouncePromise from "awesome-debounce-promise";
// import debounceResolve from "@lib/helpers/promises/debounceResolver";
import useConstant from "@lib/hooks/useConstant";
import { useAsync } from "react-async-hook";
import cn from "classnames";

const debounceResolve = AwesomeDebouncePromise;

const fieldTypes = [
  {
    name: "Single Line Text",
    description: "A short line of text.",
    powerbase_field_type_id: "1",
    db_type: "character varying",
  },
  {
    name: "Long Text",
    description: "A long text field.",
    powerbase_field_type_id: "2",
    db_type: "text",
  },
  {
    name: "Number",
    description: "An integer or a decimal number.",
    powerbase_field_type_id: "4",
  },
  {
    name: "Email",
    description: "An email address.",
    powerbase_field_type_id: "8",
    db_type: "character varying",
  },
  {
    name: "Checkbox",
    description: "A binary choice.",
    powerbase_field_type_id: "3",
    db_type: "bolean",
  },
];

const useDebouncedInput = (setNameExists) => {
  const [fieldName, setFieldName] = useState("");
  const searchPowerbase = async (text) => {
    try {
      const response = await securedApi.get(`/fields/${text}`);
      const { data } = response;
      console.log(data);
      if (data?.message) setNameExists(false);
      else if (data?.id) setNameExists(true);
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  const debouncedSearchPowerbase = useConstant(() =>
    debounceResolve(searchPowerbase, 100)
  );

  const search = useAsync(async () => {
    if (fieldName.length === 0) {
      return [];
    } else {
      return debouncedSearchPowerbase(fieldName);
    }
  }, [fieldName]);

  return {
    fieldName,
    setFieldName,
    search,
  };
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function NewField({
  tableId,
  view,
  fields,
  setIsCreatingField,
}) {
  const [selected, setSelected] = useState(fieldTypes[0]);
  // const [fieldName, setFieldName] = useState("");
  const [nameExists, setNameExists] = useState(false);
  const { fieldName, setFieldName, search } = useDebouncedInput(setNameExists);
  const fieldInputRef = useRef(null);

  useEffect(() => {
    fieldInputRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    setFieldName(e.target.value);
  };

  const toSnakeCase = (str) =>
    str &&
    str
      .match(
        /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
      )
      .map((x) => x.toLowerCase())
      .join("_");

  const addNewField = async () => {
    const payload = {
      name: toSnakeCase(fieldName.toLowerCase()),
      description: null,
      oid: 1043,
      db_type: "character varying",
      default_value: " ",
      is_primary_key: false,
      is_nullable: false,
      powerbase_table_id: tableId,
      powerbase_field_type_id: 1,
      is_pii: false,
      alias: fieldName,
      view_id: view.id,
      order: fields.length ? fields.length : 0,
    };
    const response = await securedApi.post(`/tables/${tableId}/field`, payload);
    if (response.statusText === "OK") {
      setIsCreatingField(false);
      return response.data;
    }
  };

  return (
    <div className="m-4">
      <div>
        <label htmlFor="email" className="sr-only">
          New Field
        </label>
        <input
          type="text"
          name="field-name"
          id="new-field-name"
          className={cn(
            "shadow-sm block w-full sm:text-sm border-gray-300 rounded-md",
            nameExists && "focus:ring-red-500 focus:border-red-500",
            !nameExists && "focus:ring-indigo-500 focus:border-indigo-500"
          )}
          placeholder="Enter field name (required)"
          autoComplete="off"
          ref={fieldInputRef}
          onChange={handleChange}
        />
      </div>

      <div>
        <p className="text-red-500">
          {nameExists ? "Field name already exists." : <br />}
        </p>
      </div>

      <div className="mt-2">
        <RadioGroup value={selected} onChange={setSelected}>
          <div className="bg-white rounded-md -space-y-px">
            {fieldTypes.map((fieldType, fieldTypeIdx) => (
              <RadioGroup.Option
                key={fieldType.name}
                value={fieldType}
                className={({ checked }) =>
                  classNames(
                    fieldTypeIdx === 0 ? "rounded-tl-md rounded-tr-md" : "",
                    fieldTypeIdx === fieldTypes.length - 1
                      ? "rounded-bl-md rounded-br-md"
                      : "",
                    checked
                      ? "bg-indigo-50 border-indigo-200 z-10"
                      : "border-gray-200",
                    "relative border p-4 flex cursor-pointer focus:outline-none"
                  )
                }
              >
                {({ active, checked }) => (
                  <>
                    <span
                      className={classNames(
                        checked
                          ? "bg-indigo-600 border-transparent"
                          : "bg-white border-gray-300",
                        active ? "ring-2 ring-offset-2 ring-indigo-500" : "",
                        "h-4 w-4 mt-0.5 cursor-pointer rounded-full border flex items-center justify-center"
                      )}
                      aria-hidden="true"
                    >
                      <span className="rounded-full bg-white w-1.5 h-1.5" />
                    </span>
                    <div className="ml-3 flex flex-col">
                      <RadioGroup.Label
                        as="span"
                        className={classNames(
                          checked ? "text-indigo-900" : "text-gray-900",
                          "block text-sm font-normal"
                        )}
                      >
                        {fieldType.name}
                      </RadioGroup.Label>
                      <RadioGroup.Description
                        as="span"
                        className={classNames(
                          checked ? "text-indigo-700" : "text-gray-500",
                          "block text-xs"
                        )}
                      >
                        {fieldType.description}
                      </RadioGroup.Description>
                    </div>
                  </>
                )}
              </RadioGroup.Option>
            ))}
          </div>
        </RadioGroup>
      </div>

      <div className="mt-2 flex justify-end items-baseline">
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
            nameExists && "cursor-not-allowed",
            !nameExists && "hover:bg-indigo-700"
          )}
          onClick={() => addNewField()}
          disabled={nameExists}
        >
          Add Field
        </button>
      </div>
    </div>
  );
}
