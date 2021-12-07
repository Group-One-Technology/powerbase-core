import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { PlusIcon } from '@heroicons/react/solid';
import * as Popover from '@radix-ui/react-popover';
import NewTableModal from './NewTableModal';

const AddTable = ({
  table,
  base,
  tables,
  isUploadAction,
}) => {
  const [open, setOpen] = useState(false);
  const handleAddTable = () => {
    // TODO - Implemented this earlier and didnt finish the feature yet but works on a basic level
    // setOpen(!open);
    alert('Add table clicked - COMING SOON');
  };

  const handleImportCSV = () => {
    // TODO - Implemented this earlier and didnt finish the feature yet but works on a basic level
    // setOpen(!open);
    // setIsUploadAction(true);
    alert('CSV Import Clicked - COMING SOON');
  };
  return (
    <>
      <NewTableModal
        open={open}
        setOpen={setOpen}
        table={table}
        tables={tables}
        base={base}
        isUploadAction={isUploadAction}
      />
      <Popover.Root>
        <Popover.Trigger className="mt-0.5 p-0.5 font-medium text-sm rounded-md text-gray-200 bg-gray-900 bg-opacity-20 hover:bg-gray-900 hover:bg-opacity-25 focus:bg-gray-900 focus:bg-opacity-50 focus:text-white">
          <span className="sr-only">Add Table</span>
          <PlusIcon className="h-5 w-5" />
        </Popover.Trigger>
        <Popover.Content className="w-60 mt-3 transform sm:px-0 absolute z-10">
          <div className="shadow-lg bg-white ring-1 ring-black ring-opacity-5 mt-2 p-2">
            <button
              className="text-xs font-medium text-gray-800 mt-2 cursor-pointer hover:bg-gray-200 p-2 cursor-not-allowed"
              onClick={handleAddTable}
            >
              Create a new table
            </button>
            <div className="mt-1 py-2 px-1">
              <div className="text-xs text-gray-500 px-1">IMPORT FROM</div>
              <div className="text-xs text-gray-800 mt-1 font-medium">
                <button
                  className="mt-2 cursor-pointer hover:bg-gray-200 py-2 px-1"
                  onClick={handleImportCSV}
                >
                  CSV File
                </button>
              </div>
            </div>
          </div>
        </Popover.Content>
      </Popover.Root>
    </>
  );
};

AddTable.propTypes = {
  table: PropTypes.object.isRequired,
  base: PropTypes.object.isRequired,
  tables: PropTypes.array.isRequired,
  isUploadAction: PropTypes.bool.isRequired,
};

export default AddTable;
