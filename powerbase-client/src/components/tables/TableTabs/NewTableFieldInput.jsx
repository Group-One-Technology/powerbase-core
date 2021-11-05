/* eslint-disable */
import React, { Fragment, useEffect, useState, ReactDOM } from "react";

export default function NewTableFieldInput({
  getValue,
  id,
  newFields,
  setNewFields,
}) {
  const handleChange = (e) => {
    setValue(e.target.value);

    const updatedFields = newFields.map((field) => {
      if (field.id === id) {
        return {
          id: field.id,
          fieldName: e.target.value,
          fieldTypeId: field.fieldTypeId,
        };
      }
      return field;
    });
    setNewFields(updatedFields);
  };

  console.log(newFields);

  const [value, setValue] = useState("");

  // useEffect(() => {
  //   const updatedFields = newFields.map((field) => {
  //     if (field.id === id) {
  //       console.log(field);
  //       return {
  //         id: field.id,
  //         fieldName: value,
  //         fieldTypeId: field.fieldTypeId,
  //       };
  //     }
  //     return field;
  //   });
  //   setNewFields(updatedFields);
  // }, [value]);

  return (
    <div className="mt-1 w-full">
      <input
        type="text"
        name="field"
        id={`field-${id}`}
        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        placeholder="Field name"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}
