import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import * as Popover from '@radix-ui/react-popover';
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
  const [open, setOpen] = useState(false);
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
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        type="button"
        className={cn(
          'inline-flex items-center px-1.5 py-1 border border-transparent text-sm rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 ring-gray-500',
          open && 'ring-2',
        )}
      >
        <AdjustmentsIcon className="h-4 w-4 mr-1" aria-hidden="true" />
        Fields
      </Popover.Trigger>
      <Popover.Content className="min-w-[325px] max-w-screen-sm px-4 mt-3 animate-show sm:px-0 md:max-w-screen-xl">
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
                setOpen(false);
              }}
              cancel={handleCloseAddField}
            />
          )}
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}

Fields.propTypes = {
  table: PropTypes.object.isRequired,
};
