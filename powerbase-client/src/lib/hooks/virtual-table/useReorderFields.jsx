import { useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { useViewFields } from '@models/ViewFields';
import { reorderViewFields } from '@lib/api/view-fields';
import { useSensors } from '@lib/hooks/dnd-kit/useSensors';

export function useReorderFields({ tableId, fields, setFields }) {
  const { mutate: mutateViewFields } = useViewFields();
  const [dragging, setDragging] = useState();

  const sensors = useSensors({
    keyboard: false,
    mouse: {
      activationConstraint: {
        distance: 5,
      },
    },
  });

  const handleDragStart = (evt) => setDragging(evt);
  const handleDragMove = (evt) => setDragging(evt);

  const handleDragEnd = async ({ active, over }) => {
    const oldIndex = active.data.current.index;
    const newIndex = over.data.current.index;

    if (oldIndex !== newIndex && newIndex !== oldIndex - 1) {
      const updatedFields = arrayMove(fields, oldIndex, newIndex < oldIndex ? newIndex + 1 : newIndex);

      try {
        setFields(updatedFields);
        await reorderViewFields({ tableId, viewFields: updatedFields.map((item) => item.id) });
        mutateViewFields();
      } catch (err) {
        console.log(err);
      }
    }

    setDragging(null);
  };

  return {
    sensors,
    dragging,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
}
