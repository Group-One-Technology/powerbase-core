/* eslint-disable */
import React, { useState, useRef, useEffect } from "react";
import { securedApi } from "@lib/api";
import { RadioGroup } from "@headlessui/react";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import { XIcon } from "@heroicons/react/outline";
import useConstant from "@lib/hooks/useConstant";
import { useAsync } from "react-async-hook";
import cn from "classnames";
import { FieldTypeIcon } from "@components/ui/FieldTypeIcon";
import { useFieldTypes } from "@models/FieldTypes";
import { useViewFields } from "@models/ViewFields";
import NumberFieldSelectOptions from "./NumberFieldSelectOptions";
import Checkbox from "@components/ui/Checkbox";

const debounceResolve = AwesomeDebouncePromise;

const useDebouncedInput = (setNameExists) => {
  const [fieldName, setFieldName] = useState("");
  const searchPowerbase = async (text) => {
    try {
      const response = await securedApi.get(`/fields/${text}`);
      const { data } = response;
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

const FieldTypeComponent = ({
  type,
  fieldTypes,
  setSelected,
  setNumberSubtype,
  setNumberPrecision,
  numberSubtype,
  setIsChecked,
  isChecked,
}) => {
  const collapseSelectedField = () => {
    setSelected(null);
  };

  const precisionPresenceConditions = {
    isPercent: type.name.toLowerCase() === "percent",
    isCurrency: type.name.toLowerCase() === "currency",
    isDecimal: numberSubtype?.id === 2,
  };

  const { isPercent, isCurrency, isDecimal } = precisionPresenceConditions;
  const hasPrecisionField = isPercent || isCurrency || isDecimal;
  const includeCellValidationOption =
    type.name.toLowerCase() === "single line text" ||
    type.name.toLowerCase() === "long text";

  return (
    <div className="mt-2">
      <div
        className="bg-indigo-200 hover:bg-indigo-300 cursor-default flex p-2 mb-2 rounded-md hover:rounded-md"
        onClick={collapseSelectedField}
      >
        <div>
          <FieldTypeIcon
            typeId={type.id}
            fieldTypes={fieldTypes}
            isPrimaryKey={false}
            isForeignKey={false}
            className="mr-1"
          />
        </div>
        <p className="font-medium text-gray-900 cursor-default">{type.name}</p>
        <XIcon className="h-4 w-4 ml-auto my-auto" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs text-gray-600 ml-2">{type.description}</p>
      </div>
      {!includeCellValidationOption && (
        <div>
          <Checkbox
            setIsChecked={setIsChecked}
            isChecked={isChecked}
            label="Disable cell validation"
          />
        </div>
      )}
      {(type.name.toLowerCase() === "number" ||
        type.name.toLowerCase() === "percent") && (
        <div className={cn("mt-4 mb-6 h-24", hasPrecisionField && "h-56")}>
          {type.name.toLowerCase() === "number" && (
            <NumberFieldSelectOptions
              isPrecision={false}
              isPercent={isPercent}
              setNumberSubtype={setNumberSubtype}
            />
          )}
          {hasPrecisionField && (
            <NumberFieldSelectOptions
              isPrecision={true}
              isPercent={isPercent}
              setNumberPrecision={setNumberPrecision}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default function NewField({
  tableId,
  view,
  fields,
  setIsCreatingField,
}) {
  const [selected, setSelected] = useState(null);
  const [selectedNumberType, setSelectedNumberType] = useState(null);
  const [nameExists, setNameExists] = useState(false);
  const [numberSubtype, setNumberSubtype] = useState(null);
  const [numberPrecision, setNumberPrecision] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const { fieldName, setFieldName } = useDebouncedInput(setNameExists);
  const fieldInputRef = useRef(null);
  const { mutate: mutateViewFields } = useViewFields();
  const { data: fieldTypes } = useFieldTypes();
  const [supportedNewFieldTypes, setSupportedNewFieldTypes] = useState();

  useEffect(() => {
    fieldInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const supported = ["string", "number", "date"];
    setSupportedNewFieldTypes(
      fieldTypes?.filter((item) =>
        supported.includes(item.dataType.toLowerCase())
      )
    );
  }, [fieldTypes]);

  const handleChange = (e) => {
    setFieldName(e.target.value);
  };

  const handleFieldTypeClick = (fieldType) => {
    setSelected(fieldType);
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
      db_type: selected.dbType,
      default_value: "",
      is_primary_key: false,
      is_nullable: false,
      powerbase_table_id: tableId,
      powerbase_field_type_id: selected.id,
      is_pii: false,
      alias: fieldName,
      view_id: view.id,
      order: fields.length ? fields.length : 0,
      is_virtual: true,
      allow_dirty_value: isChecked,
      precision: numberPrecision ? numberPrecision.precision : null,
    };

    const response = await securedApi.post(`/tables/${tableId}/field`, payload);
    if (response.statusText === "OK") {
      setIsCreatingField(false);
      mutateViewFields();
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

      {!selected && (
        <div className="mt-2">
          {supportedNewFieldTypes?.map((type) => (
            <div
              className="hover:bg-indigo-200 cursor-default flex p-2 mb-2 hover:rounded-md"
              onClick={() => handleFieldTypeClick(type)}
              key={type.id}
            >
              <div>
                <FieldTypeIcon
                  typeId={type.id}
                  fieldTypes={fieldTypes}
                  isPrimaryKey={false}
                  isForeignKey={false}
                  className="mr-3 mt-0.5"
                />
              </div>
              <p className="font-medium text-gray-900 cursor-default">
                {type.name}
              </p>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <FieldTypeComponent
          type={selected}
          fieldTypes={fieldTypes}
          setSelected={setSelected}
          setNumberPrecision={setNumberPrecision}
          setNumberSubtype={setNumberSubtype}
          numberSubtype={numberSubtype}
          setIsChecked={setIsChecked}
          isChecked={isChecked}
        />
      )}

      <div className="mt-8 flex justify-end items-baseline">
        <button
          type="button"
          className="mr-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => setIsCreatingField(false)}
        >
          Cancel
        </button>

        {selected && (
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
        )}
      </div>
    </div>
  );
}
