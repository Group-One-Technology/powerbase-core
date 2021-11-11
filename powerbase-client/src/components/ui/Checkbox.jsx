/* eslint-disable */
import React from "react";
export default function Checkbox({ isChecked, setIsChecked, label }) {
  const handleCheck = () => {
    setIsChecked(!isChecked);
  };
  return (
    <fieldset className="space-y-5 mt-4">
      <div className="relative flex items-start">
        <div className="flex items-center h-5">
          <input
            id="data-validation-enabler"
            name="data-validation-enabler"
            type="checkbox"
            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            onChange={handleCheck}
            checked={isChecked}
          />
        </div>
        <div className="ml-3 text-sm">
          <label
            htmlFor="data-validation-enabler"
            className="font-normal text-gray-600"
          >
            {label}
          </label>
        </div>
      </div>
    </fieldset>
  );
}
