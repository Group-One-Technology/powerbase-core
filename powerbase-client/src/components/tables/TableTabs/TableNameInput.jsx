/* eslint-disable */
import React, { Fragment, useEffect, useState, ReactDOM } from "react";

export default function TableNameInput({ tableName, setTableName }) {
  const handleChange = (e) => {
    setTableName(e.target.value);
  };

  //   const [value, setValue] = useState("");

  return (
    <div className="mt-1 mb-2 w-full">
      <input
        type="text"
        name="field"
        id={`new-table`}
        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        placeholder="Table name"
        value={tableName}
        onChange={handleChange}
      />
    </div>
  );
}
