/* eslint-disable */
import React, { Fragment, useEffect, useState, ReactDOM } from "react";

export default function NewTableFieldInput() {
  return (
    <div className="mt-1 w-full">
      <input
        type="email"
        name="email"
        id="email"
        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        placeholder="you@example.com"
      />
    </div>
  );
}
