/* eslint-disable */
import React, { Fragment, useEffect, useState, ReactDOM } from "react";
import { PlusIcon } from "@heroicons/react/solid";
import * as Popover from "@radix-ui/react-popover";
import NewTableModal from "./NewTableModal";

const AddTable = ({ table, base, tables }) => {
  const [open, setOpen] = useState(false);
  const handleAddTable = () => {
    setOpen(!open);
  };
  return (
    <>
      <NewTableModal
        open={open}
        setOpen={setOpen}
        table={table}
        tables={tables}
        base={base}
      />
      <Popover.Root>
        <Popover.Trigger className="mt-0.5 p-0.5 font-medium text-sm rounded-md text-gray-200 bg-gray-900 bg-opacity-20 hover:bg-gray-900 hover:bg-opacity-25 focus:bg-gray-900 focus:bg-opacity-50 focus:text-white">
          <span className="sr-only">Add Table</span>
          <PlusIcon className="h-5 w-5" />
        </Popover.Trigger>
        <Popover.Content className="w-60 mt-3 transform sm:px-0 absolute z-10">
          <div className="shadow-lg bg-white ring-1 ring-black ring-opacity-5 mt-2 p-2">
            <div
              className="text-xs font-medium text-gray-800 mt-2 cursor-pointer hover:bg-gray-200 p-2"
              onClick={handleAddTable}
            >
              Create a new table
            </div>
            <div className="mt-1 py-2 px-1">
              <div className="text-xs text-gray-500 px-1">IMPORT FROM</div>
              <div className="text-xs text-gray-800 mt-1 font-medium">
                <div className="mt-2 cursor-pointer hover:bg-gray-200 py-2 px-1">
                  CSV File
                </div>
              </div>
            </div>
          </div>
        </Popover.Content>
      </Popover.Root>
    </>
  );
};

export default AddTable;
