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

  const handleResizeField = (viewFieldId, newWidth) => {
    if (newWidth <= 0) return;

    if (canManageView) {
      if (!loading) saving();
      const updatedFields = fields.map((column) => ({
        ...column,
        width: column.id === viewFieldId
          ? newWidth
          : column.width,
      }));

      setFields(updatedFields);
    }
  };

  const handleResizeFieldEnd = async (viewFieldId, newWidth) => {
    if (newWidth <= 0) return;

    if (canManageView) {
      if (!loading) saving();
      const updatedFields = fields.map((column) => ({
        ...column,
        width: column.id === viewFieldId
          ? newWidth
          : column.width,
      }));

      setFields(updatedFields);

      try {
        await resizeViewField({ id: viewFieldId, width: newWidth });
        await mutateViewFields(updatedFields);
        saved();
      } catch (err) {
        captureError(err);
        catchError(err);
      }
    }
  };

  return { handleResizeField, handleResizeFieldEnd };
}
