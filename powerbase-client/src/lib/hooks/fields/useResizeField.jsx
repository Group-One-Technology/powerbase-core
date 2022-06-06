import React from 'react';
import debounce from 'lodash.debounce';
import { useBaseUser } from '@models/BaseUser';
import { useSaveStatus } from '@models/SaveStatus';
import { useTableView } from '@models/TableView';
import { useViewFields } from '@models/ViewFields';
import { PERMISSIONS } from '@lib/constants/permissions';
import { resizeViewField } from '@lib/api/view-fields';
import { captureError } from '@lib/helpers/captureError';

export function useResizeField({ fields, setFields }) {
  const { baseUser } = useBaseUser();
  const { data: view } = useTableView();
  const { mutate: mutateViewFields } = useViewFields();
  const {
    saving, saved, catchError, loading,
  } = useSaveStatus();
  const canManageView = baseUser?.can(PERMISSIONS.ManageView, view) && !view.isLocked;

  const updateField = React.useCallback(debounce(async (viewFieldId, newWidth, updatedFields) => {
    saving();

    try {
      await resizeViewField({ id: viewFieldId, width: newWidth });
      await mutateViewFields(updatedFields);
      saved();
    } catch (err) {
      captureError(err);
      catchError(err);
    }
  }, 1000), [view]);

  const handleResizeField = (viewFieldId, newWidth) => {
    if (canManageView) {
      if (!loading) saving();
      const updatedFields = fields.map((column) => ({
        ...column,
        width: column.id === viewFieldId
          ? newWidth
          : column.width,
      }));

      setFields(updatedFields);
      updateField(viewFieldId, newWidth, updatedFields);
    }
  };

  return { handleResizeField };
}
