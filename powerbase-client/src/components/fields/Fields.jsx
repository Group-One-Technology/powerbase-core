import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { Popover, Transition } from '@headlessui/react';
import { AdjustmentsIcon, PlusIcon } from '@heroicons/react/outline';

import { useBaseUser } from '@models/BaseUser';
import { useViewFields } from '@models/ViewFields';
import { FIELDS_SCREEN } from '@lib/constants/field';
import { PERMISSIONS } from '@lib/constants/permissions';
import { FieldList } from './Fields/FieldList';
import { CreateField } from './CreateField';

export function Fields({ table }) {
  const { baseUser } = useBaseUser();
  const { data: initialFields } = useViewFields();
  const [fields, setFields] = useState(initialFields);

  const [screen, setScreen] = useState(FIELDS_SCREEN.Fields);
  const canAddFields = baseUser?.can(PERMISSIONS.AddFields, table);

  const handleAddField = () => {
    if (!canAddFields) return;
    setScreen(FIELDS_SCREEN.AddField);
  };

  const handleCloseAddField = () => {
    setScreen(FIELDS_SCREEN.Fields);
  };

  useEffect(() => {
    setFields(initialFields);
  }, [initialFields]);

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            type="button"
            className={cn(
              'inline-flex items-center px-1.5 py-1 border border-transparent text-sm rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 ring-gray-500',
              open && 'ring-2',
            )}
          >
            <AdjustmentsIcon className="block h-4 w-4 mr-1" />
            Fields
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
              {({ close }) => (
                <div className="rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  {screen === FIELDS_SCREEN.Fields && (
                    <FieldList fields={fields} setFields={setFields}>
                      {canAddFields && (
                        <button
                          type="button"
                          className="px-3 py-2 w-full text-left text-sm bg-gray-50  flex items-center transition duration-150 ease-in-out text-blue-600  hover:bg-gray-100 focus:bg-gray-100"
                          onClick={handleAddField}
                        >
                          <PlusIcon className="mr-1 h-4 w-4" />
                          Add a field
                        </button>
                      )}
                    </FieldList>
                  )}
                  {screen === FIELDS_SCREEN.AddField && (
                    <CreateField
                      table={table}
                      close={() => {
                        handleCloseAddField();
                        close();
                      }}
                      cancel={handleCloseAddField}
                    />
                  )}
                </div>
              )}
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}

Fields.propTypes = {
  table: PropTypes.object.isRequired,
};
