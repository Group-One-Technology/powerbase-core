import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { Popover, Transition } from '@headlessui/react';
import { AdjustmentsIcon, TableIcon, PlusIcon } from '@heroicons/react/outline';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSaveStatus } from '@models/SaveStatus';
import { useViewFields } from '@models/ViewFields';
import { useTableView } from '@models/TableView';
import { useViewFieldState } from '@models/view/ViewFieldState';
import { useBaseUser } from '@models/BaseUser';
import { hideAllViewFields } from '@lib/api/view-fields';
import { useReorderFields } from '@lib/hooks/fields/useReorderFields';
import { PERMISSIONS } from '@lib/constants/permissions';
import { FieldItem } from './FieldItem';
import NewField from './NewField';

export function Fields({ table }) {
  const { baseUser } = useBaseUser();
  const { data: view } = useTableView();
  const { saving, saved, catchError } = useSaveStatus();
  const { setFields: setRecordFields, setHasAddedNewField } = useViewFieldState();
  const { data: initialFields, mutate: mutateViewFields } = useViewFields();

  const [fields, setFields] = useState(initialFields);
  const canManageViews = baseUser?.can(PERMISSIONS.ManageView, table);
  const canAddFields = baseUser?.can(PERMISSIONS.AddFields, table);
  /* Setting this as a way of checking for tables with unique row identifiers
  as it is messier to maintain witout that for now */
  const containsPrimaryKey = initialFields?.some((field) => field.isPrimaryKey);
  const [isCreatingField, setIsCreatingField] = useState(false);
  const { sensors, handleReorderFields } = useReorderFields({
    table,
    fields,
    setFields,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFields(initialFields);
  }, [initialFields]);

  const handleAddNewField = () => {
    setIsCreatingField(!isCreatingField);
  };

  const handleHideAll = async () => {
    if (canManageViews) {
      saving();
      setLoading(true);

      const updatedFields = fields.map((item) => ({
        ...item,
        isHidden: true,
      }));

      setFields(updatedFields);
      setRecordFields(updatedFields);
      setLoading(false);

      try {
        await hideAllViewFields({ viewId: view.id });
        await mutateViewFields(updatedFields);
        saved();
      } catch (err) {
        catchError(err.response.data.error || err.response.data.exception);
      }
    }
  };

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            type="button"
            className={cn(
              'inline-flex items-center px-1.5 py-1 border border-transparent text-xs font-medium rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 ring-gray-500',
              {
                'ring-2': open,
              },
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
            <Popover.Panel
              className={cn(
                'absolute z-10 w-screen px-4 mt-3 transform -translate-x-1/2 left-1/2 sm:px-0 lg:max-w-md',
              )}
            >
              {({ close }) => (
                <div className="overflow-hidden rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  {!isCreatingField && (
                    <div className="text-sm text-gray-900">
                      <h4 className="flex mx-3 mt-3 items-center">
                        Fields for&nbsp;
                        <strong>
                          <TableIcon className="inline mr-1 h-5 w-5" />
                          {view.name}
                        </strong>
                      </h4>
                      {canManageViews && (
                        <div className="mx-2 flex justify-end">
                          <button
                            type="button"
                            className="p-1 text-indigo-500"
                            onClick={handleHideAll}
                            disabled={loading}
                          >
                            Hide all
                          </button>
                        </div>
                      )}
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleReorderFields}
                      >
                        <SortableContext
                          items={fields}
                          strategy={verticalListSortingStrategy}
                        >
                          <ul className="m-3 list-none flex flex-col">
                            {fields.map((field) => (
                              <FieldItem
                                key={field.id}
                                table={table}
                                field={field}
                                setFields={setFields}
                              />
                            ))}
                          </ul>
                        </SortableContext>
                      </DndContext>
                      {canAddFields && containsPrimaryKey && (
                        <button
                          type="button"
                          className="px-3 py-2 w-full text-left text-sm bg-gray-50  flex items-center transition duration-150 ease-in-out text-blue-600  hover:bg-gray-100 focus:bg-gray-100"
                          onClick={handleAddNewField}
                        >
                          <PlusIcon className="mr-1 h-4 w-4" />
                          Add a field
                        </button>
                      )}
                    </div>
                  )}
                  {isCreatingField && (
                    <div className="text-sm text-gray-900">
                      <NewField
                        tableId={table.id}
                        fields={fields}
                        view={view}
                        setIsCreatingField={setIsCreatingField}
                        close={close}
                        setHasAddedNewField={setHasAddedNewField}
                      />
                    </div>
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
