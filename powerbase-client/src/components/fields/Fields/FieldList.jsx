import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { captureError } from '@lib/helpers/captureError';
import { PlusIcon, TableIcon } from '@heroicons/react/outline';
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

export function FieldList({ fields, setFields, children }) {
  const { baseUser } = useBaseUser();
  const { data: view } = useTableView();
  const { saving, saved, catchError } = useSaveStatus();
  const { setFields: setRecordFields } = useViewFieldState();
  const { mutate: mutateViewFields } = useViewFields();

  const { sensors, handleReorderFields } = useReorderFields({ fields, setFields });
  const [loading, setLoading] = useState(false);

  const canManageView = baseUser?.can(PERMISSIONS.ManageView, view) && !view.isLocked;

  const handleHideAll = async () => {
    if (canManageView) {
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
        captureError(err);
        catchError(err);
      }
    }
  };

  return (
    <div>
      <div className="py-2">
        <div className="text-sm text-gray-900">
          <h4 className="flex mx-3 mt-2 items-center">
            Fields for&nbsp;
            <strong>
              <TableIcon className="inline mr-1 h-5 w-5" />
              {view.name}
            </strong>
          </h4>
          {canManageView && fields.length > 0 && (
          <div className="mx-2 flex justify-end">
            <button
              type="button"
              className="p-1 text-indigo-500"
              onClick={handleHideAll}
              disabled={loading || fields.every((item) => item.isHidden)}
            >
              Hide all
            </button>
          </div>
          )}
        </div>
        {fields.length > 0
          ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleReorderFields}>
              <SortableContext items={fields} strategy={verticalListSortingStrategy}>
                <ul className="m-3 list-none flex flex-col">
                  {fields.map((field) => <FieldItem key={field.id} view={view} field={field} setFields={setFields} />)}
                </ul>
              </SortableContext>
            </DndContext>
          ) : (
            <p className="m-3 text-sm font-medium text-center">No fields.</p>
          )}
      </div>

      {children}
    </div>
  );
}

FieldList.propTypes = {
  fields: PropTypes.array.isRequired,
  setFields: PropTypes.func.isRequired,
  children: PropTypes.any,
};
