/* eslint-disable */
import React from "react";
import isObject from "lodash/isObject";

function getValue(value) {
  if (isObject(value)) return JSON.stringify(value);
  if (value && value.toString) return value.toString();
  if (value === null) return "";
  if (value === undefined) return "";
  return value;
}

export default function TextCell({ isEditing, onChange, value }, ref) {
  const cellInnerEl = isEditing ? (
    <input
      value={getValue(value)}
      onChange={(newVal) => {
        if (isObject(value)) onChange(JSON.parse(newVal));
        else onChange(newVal);
      }}
      ref={ref}
    />
  ) : (
    getValue(value)
  );
  return cellInnerEl;
}
