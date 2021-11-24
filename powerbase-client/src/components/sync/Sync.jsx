/* eslint-disable */
import React, { Fragment, useRef } from "react";
import cn from "classnames";
import { Popover, Transition } from "@headlessui/react";
import { RefreshIcon } from "@heroicons/react/outline";
import SyncItems from "./SyncItems";

const Sync = ({ fields, table }) => {
  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            type="button"
            className={cn(
              "inline-flex items-center px-1.5 py-1 border border-transparent text-xs font-medium rounded hover:bg-gray-100 focus:outline-none focus:ring-2 ring-gray-500",
              open && "ring-2",
              false ? "text-indigo-700" : "text-gray-700"
            )}
          >
            <RefreshIcon className="block h-4 w-4 mr-1" />
            Sync
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute z-10 w-screen px-4 mt-3 transform -translate-x-1/2 left-1/2 sm:px-0 lg:max-w-md">
              <div className="overflow-hidden rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-2">
                <div className="text-sm text-gray-700 px-3">
                  Migrate Virtual Fields to{" "}
                  <span className="font-bold">{table.name}</span>
                </div>
                <div className="mt-6">
                  <SyncItems fields={fields} />
                  {/* {fields
                    .filter((field) => field.isVirtual)
                    .map((virtualField) => (
                      <div>
                        <div className="text-sm text-gray-700 px-3">
                          {virtualField.alias || virtualField.name}
                        </div>
                      </div>
                    ))} */}
                </div>
                <div className="mt-6 px-3 flex justify-end items-baseline">
                  <button
                    type="button"
                    className="mr-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={cn(
                      `inline-flex items-center px-4 py-2 border border-transparent text-xs font-medium rounded-sm shadow-sm text-white bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`
                    )}
                    onClick={() => addNewField()}
                  >
                    Sync
                  </button>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default Sync;
