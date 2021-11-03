import { arrayMove } from '@dnd-kit/sortable';
import { useViewFields } from '@models/ViewFields';
import { useSaveStatus } from '@models/SaveStatus';
import { reorderViewFields } from '@lib/api/view-fields';
import { useSensors } from '@lib/hooks/dnd-kit/useSensors';
import { useTableView } from '@models/TableView';

export function useReorderFields({ fields, setFields }) {
  const { saving, saved, catchError } = useSaveStatus();
  const { data: view } = useTableView();
  const { mutate: mutateViewFields } = useViewFields();
  const sensors = useSensors();

  const handleReorderFields = async ({ active, over }) => {
    if (active.id !== over.id) {
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
        catchError(err);
      }
    }
  };

  return { sensors, handleReorderFields };
}
