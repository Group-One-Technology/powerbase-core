/* eslint-disable */
import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon, PlusCircleIcon } from "@heroicons/react/outline";
import NewTableField from "./NewTableField";

const initial = [
  {
    id: 1,
    fieldName: "",
    fieldTypeId: 1,
  },
];

const types = [];

export default function NewTableModal({ open, setOpen }) {
  const [newFields, setNewFields] = useState(initial);
  const [currentCount, setCurrentCount] = useState(1);

  const handleAddNewField = () => {
    setNewFields([
      ...newFields,
      { id: currentCount + 1, fieldName: "", fieldTypeId: 1 },
    ]);
  };

  const getValue = (id) => {
    console.log("");
  };

  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={setOpen}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
              {newFields?.map((field, index) => (
                <NewTableField
                  key={index}
                  newFields={newFields}
                  newField={field}
                  count={index}
                />
              ))}

              <div className="flex flex-row justify-center mt-2">
                <p
                  className="flex flex-row cursor-pointer"
                  onClick={handleAddNewField}
                >
                  <span className="flex-row">
                    <PlusCircleIcon className="text-indigo-400 w-6 h-6" />
                  </span>
                  <span className="text-sm text-indigo-400 ml-1 mt-0.5">
                    {" "}
                    Add a New Field{" "}
                  </span>
                </p>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
