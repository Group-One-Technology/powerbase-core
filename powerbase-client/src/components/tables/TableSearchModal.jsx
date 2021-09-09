/* eslint-disable  */
import React, {
  Fragment, useRef, useState, useEffect,
} from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { SearchIcon, ExclamationIcon, CheckIcon } from '@heroicons/react/outline';

export default function TableSearchModal({
  open, setOpen, tables, handleTableChange, tableId,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasHovered, setHasHovered] = useState(false);
  const focusRef = useRef(null);
  const searchInputRef = useRef(null);
  const listContainerRef = useRef(null)

  const listItemRefs = tables?.reduce((acc, value) => {
    acc[value.id] = React.createRef();
    return acc;
  }, {});

  const scrollToActiveItem = (id) => listItemRefs[id].current?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleHover = () => {
    setHasHovered(true);
  };

  useEffect(() => {
    const results = tables?.filter((table) => table.alias?.toLowerCase().includes(searchTerm) || table.name.toLowerCase().includes(searchTerm));
    setSearchResults(results);
  }, [searchTerm]);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);


  function onKeyDown(event) {
    const isUp = event.key === 'ArrowUp';
    const isDown = event.key === 'ArrowDown';
    const inputIsFocused = document.activeElement === searchInputRef.current;

    const resultsItems = Array.from(listContainerRef.current.children)

    const activeResultIndex = resultsItems.findIndex(child => {
      return child.querySelector('a') === document.activeElement;
    });
    if ( isUp ) {
      if ( inputIsFocused ) {
        resultsItems[resultsItems.length - 1].querySelector('a').focus();
      } else if ( resultsItems[activeResultIndex - 1] ) {
        resultsItems[activeResultIndex - 1].querySelector('a').focus();
      } else {
        searchInputRef.current.focus();
      }
    }

    if ( isDown ) {
      if ( inputIsFocused ) {
        resultsItems[0].querySelector('a').focus();
      } else if ( resultsItems[activeResultIndex + 1] ) {
        resultsItems[activeResultIndex + 1].querySelector('a').focus();
      } else {
        searchInputRef.current.focus();
      }
    }
  }


  useEffect(() => {
    if ( searchResults.length ) {
      document.body.addEventListener('keydown', onKeyDown);
    } else {
      document.body.removeEventListener('keydown', onKeyDown);
    }
    return () => {
      document.body.removeEventListener('keydown', onKeyDown);
    }
  }, [searchResults]);


  const handleSearchResultClick = (table) => {
    setOpen(false);
    setSearchResults(tables);
    return handleTableChange(table);
  };


  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="fixed z-10 inset-0  max-w-sm mt-16 ml-4 max-h-8" onClose={() => setOpen(false)} initialFocus={focusRef}>
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
            <div className="inline-block align-bottom bg-white rounded-md px-4 pt-5 pb-4 text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12">
                  <div className="mt-1 relative rounded-md shadow-sm w-full">
                    <input
                      type="text"
                      name="search-input"
                      id="table-search-input"
                      className="outline-none focus:outline-none block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Search for a table"
                      onChange={handleChange}
                      autoComplete="off"
                      ref={searchInputRef}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <SearchIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-center sm:mt-5">
                  {searchResults && (
                  <div className="mt-1 overflow-y-auto">
                    <ul className="max-h-60 " id = "table-search-modal-list" onMouseEnter={() => toggleHover()} ref={listContainerRef}>
                      {searchResults.map((item) => (
                        <li
                          className={`p-2 text-sm cursor-pointer hover:bg-gray-200 flex justify-center 
                          space-x-1.5 ${!hasHovered && item.id === tableId ? 'bg-gray-200' : ''}`}
                          key={item?.id}
                          id={item.id === tableId ? 'mouse' : ''}
                          ref={listItemRefs[item.id]}
                          onClick={() => handleSearchResultClick({ table: item })}
                        > <a href="#" className="focus:bg-gray-200" ><span>{item.id === tableId ? (<CheckIcon className="h-5 w-5" />) : ''}</span>
                          <span>{item.alias || item.name}</span></a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  )}{!searchResults.length && (
                  <div className="flex flex-col justify-center content-center items-center">
                    <ExclamationIcon className="h-9 w-9 text-gray-400" />
                    <p className="text-gray-400 text-sm mt-1"> There are no matching tables.</p>
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
