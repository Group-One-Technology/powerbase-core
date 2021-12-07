import { arrayMove } from '@dnd-kit/sortable';
import { useViewFields } from '@models/ViewFields';
import { useSaveStatus } from '@models/SaveStatus';
import { useBaseUser } from '@models/BaseUser';
import { useTableView } from '@models/TableView';
import { reorderViewFields } from '@lib/api/view-fields';
import { useSensors } from '@lib/hooks/dnd-kit/useSensors';
import { PERMISSIONS } from '@lib/constants/permissions';

export function useReorderFields({ fields, setFields }) {
  const { baseUser } = useBaseUser();
  const { saving, saved, catchError } = useSaveStatus();
  const { data: view } = useTableView();
  const { mutate: mutateViewFields } = useViewFields();

  const canManageView = baseUser?.can(PERMISSIONS.ManageView, view) && !view.isLocked;
  const sensors = useSensors();

  const handleReorderFields = async ({ active, over }) => {
    if (active.id !== over.id && canManageView) {
      saving();

      const oldIndex = fields.findIndex((item) => item.id === active.id);
      const newIndex = fields.findIndex((item) => item.id === over.id);
      const updatedFields = arrayMove(fields, oldIndex, newIndex).map((item, index) => ({
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
        catchError(err.response.data.error || err.response.data.exception);
      }
    }
  };

  return { sensors, handleReorderFields };
}
