/* eslint-disable */
import React, { Fragment, useEffect, useState, ReactDOM } from "react";

import { ArrowRightIcon, TrashIcon } from "@heroicons/react/solid";
import NewTableFieldInput from "./NewTableFieldInput";
import NewTableFieldSelect from "./NewTableFieldSelect";

export default function Field({
  id,
  getValue,
  newFields,
  setNewFields,
  count,
}) {
  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <>
      {count < 1 && (
        <div className="grid grid-cols-2 px-2">
          <div className=" text-sm font-medium text-gray-700 mb-1 font-semibold">
            Field Name
          </div>
          <div
            className={classNames(
              `text-sm font-medium text-gray-700 mb-1 font-semibold justify-self-start ml-2`,
              newFields.length === 1 && `ml-6 pl-0.5`
            )}
          >
            Field Type
          </div>
        </div>
      )}
      <div className="flex flex-row justify-center w-full space-x-4 rounded-sm p-2">
        <div className="vercel w-full ">
          {/* <div className="hidden text-sm font-medium text-gray-700 mb-2 font-semibold sm:flex">
            Field Name
          </div> */}
          <NewTableFieldInput
            newFields={newFields}
            setNewFields={setNewFields}
            getValue={getValue}
            id={id}
          />
        </div>

        <div className={`flex flex-col justify-center`}>
          <ArrowRightIcon className={`h-5 w-5 text-gray-400 `} />
        </div>

        <div className="editmode w-full ">
          {/* <div className="hidden text-sm font-medium text-gray-700 mb-2 font-semibold sm:flex">
            Field Type
          </div> */}
          <NewTableFieldSelect />
        </div>
        {newFields.length > 1 && (
          <div
            className={`flex flex-col justify-center text-gray-500 
        }`}
          >
            <TrashIcon
              onClick={() => removeField(field.id)}
              className={`w-5 h-5  cursor-pointer`}
            />
            {/* <p
              onClick={() => removeField(field.id)}
              className="text-sm text-red-500 mt-1 self-center cursor-pointer hidden sm:flex"
            >
              Unlink
            </p> */}
          </div>
        )}
      </div>
    </>
  );
}
