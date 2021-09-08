/* eslint-disable  */
/* eslint-disable react/prop-types */
import React, {
  Fragment, useRef, useState, useEffect,
} from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { SearchIcon } from '@heroicons/react/outline';

export default function TableSearchModal({
  open, setOpen, bgColor, tables, handleTableChange
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };
  useEffect(() => {
    const results = tables?.filter((table) => table.alias?.toLowerCase().includes(searchTerm) || table.name?.toLowerCase().includes(searchTerm));
    setSearchResults(results);
  }, [searchTerm]);

  const handleSearchResultClick = (table) => {
      setOpen(false)
      setSearchResults(tables)
      return handleTableChange(table)
  }

  const focusRef = useRef(null);
  const color = bgColor.split('-')[1]
  console.log(color)

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="fixed z-10 inset-0  max-w-sm mt-16 ml-4" onClose={() => setOpen(false)} initialFocus={focusRef}>
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
          {/* <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span> */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-md px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12" ref={focusRef}>
                  <div className="mt-1 relative rounded-md shadow-sm w-full">
                    <input
                      type="text"
                      name="account-number"
                      id="account-number"
                      className={`outline-none focus:outline-none block w-full pr-10 sm:text-sm border-gray-300 rounded-md`}
                      placeholder="Search for a table"
                      onChange={handleChange}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <div className="mt-2">
                    <ul>
                      {searchResults && searchResults.map((item) => <li className={`p-2 text-sm cursor-pointer hover:bg-gray-200`} key={item?.id} onClick={() => handleSearchResultClick({ table: item })}>{item.alias || item.name}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
