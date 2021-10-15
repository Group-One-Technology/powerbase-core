import { arrayMove } from '@dnd-kit/sortable';
import { useViewFields } from '@models/ViewFields';
import { reorderViewFields } from '@lib/api/view-fields';
import { useSensors } from '@lib/hooks/dnd-kit/useSensors';

export function useReorderFields({ tableId, fields, setFields }) {
  const { mutate: mutateViewFields } = useViewFields();
  const sensors = useSensors();

  const handleReorderFields = async ({ active, over }) => {
    if (active.id !== over.id) {
      const oldIndex = fields.findIndex((item) => item.id === active.id);
      const newIndex = fields.findIndex((item) => item.id === over.id);
      const updatedFields = arrayMove(fields, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index,
      }));

      setFields(updatedFields);
      try {
        await reorderViewFields({
          tableId,
          viewFields: updatedFields.map((item) => item.id),
        });
        mutateViewFields(updatedFields);
      } catch (err) {
        console.log(err);
      }
    }
  };

  return { sensors, handleReorderFields };
}
