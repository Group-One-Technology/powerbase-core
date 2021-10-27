/* eslint-disable */
import React from "react";
import isObject from "lodash/isObject";
import * as Tooltip from "@radix-ui/react-tooltip";

function getValue(value) {
  if (isObject(value)) return JSON.stringify(value);
  if (value && value.toString) return value.toString();
  if (value === null) return "";
  if (value === undefined) return "";
  return value;
}

function TextCell({ isEditing, onChange, value }, ref) {
  const cellInnerEl = isEditing ? (
    <input
      value={getValue(value)}
      className="w-full h-full focus:outline-none"
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

export default React.forwardRef(TextCell);
