import { arrayMove } from '@dnd-kit/sortable';
import { useViewFields } from '@models/ViewFields';
import { useSaveStatus } from '@models/SaveStatus';
import { useBaseUser } from '@models/BaseUser';
import { useTableView } from '@models/TableView';
import { captureError } from '@lib/helpers/captureError';
import { reorderViewFields } from '@lib/api/view-fields';
import { PERMISSIONS } from '@lib/constants/permissions';

export function useRearrangeColumns({ fields, setFields }) {
  const { baseUser } = useBaseUser();
  const { saving, saved, catchError } = useSaveStatus();
  const { data: view } = useTableView();
  const { mutate: mutateViewFields } = useViewFields();

  const canManageView = baseUser?.can(PERMISSIONS.ManageView, view) && !view.isLocked;

  const handleRearrangeColumn = async (startIndex, endIndex) => {
    if (startIndex !== endIndex && canManageView) {
      saving();

      const updatedFields = arrayMove(fields, startIndex, endIndex).map((item, index) => ({
        ...item,
        order: index,
      }));

      setFields(updatedFields);
      try {
        await reorderViewFields({
          viewId: view.id,
          viewFields: updatedFields.map((item) => item.id),
        });
        await mutateViewFields(updatedFields);
        saved();
      } catch (err) {
        captureError(err);
        catchError(err);
      }
    }
  };

  return { handleRearrangeColumn };
}
