/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable react/prop-types */
import React, {
  Fragment, useRef, useState, useEffect,
} from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { SearchIcon, ExclamationIcon } from '@heroicons/react/outline';

export default function TableSearchModal({
  open, setOpen, bgColor, tables, handleTableChange,
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
    setOpen(false);
    setSearchResults(tables);
    return handleTableChange(table);
  };

  const focusRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

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
                <div className="mx-auto flex items-center justify-center h-12">
                  <div className="mt-1 relative rounded-md shadow-sm w-full">
                    <input
                      type="text"
                      name="account-number"
                      id="account-number"
                      className="outline-none focus:outline-none block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Search for a table"
                      onChange={handleChange}
                      ref={searchInputRef}
                    //   onBlur={({ target }) => target.focus()}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <SearchIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-center sm:mt-5">
                  {searchResults && (
                  <div className="mt-1">
                    <ul>
                      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
                      {searchResults?.map((item) => <li className="p-2 text-sm cursor-pointer hover:bg-gray-200" key={item?.id} onClick={() => handleSearchResultClick({ table: item })}>{item.alias || item.name}</li>)}
                    </ul>
                  </div>
                  )}{!searchResults.length && (
                  <div className="flex flex-col justify-center content-center">
                    <ExclamationIcon className="h-9 w-9 text-gray-400" />
                    <div> There are no matching tables.</div>
                  </div>
                  )}
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
