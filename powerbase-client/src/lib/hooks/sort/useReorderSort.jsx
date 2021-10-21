import { useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { useSaveStatus } from '@models/SaveStatus';
import { useMounted } from '@lib/hooks/useMounted';
import { useSensors } from '@lib/hooks/dnd-kit/useSensors';

export function useReorderSort({ sort, updateSort }) {
  const { mounted } = useSaveStatus();
  const { saving, saved, catchError } = useMounted();
  const [dragging, setDragging] = useState(false);
  const sensors = useSensors();

  const handleDragStart = () => setDragging(true);

  const handleReorderSort = async ({ active, over }) => {
    if (active.id !== over.id) {
      saving();

      const oldIndex = sort.findIndex((item) => item.id === active.id);
      const newIndex = sort.findIndex((item) => item.id === over.id);
      const updatedSort = arrayMove(sort, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index,
      }));

      try {
        await updateSort(updatedSort);
        saved();
      } catch (err) {
        catchError(err);
      }
    }

    mounted(() => setDragging(false));
  };

  return {
    dragging,
    sensors,
    handleDragStart,
    handleReorderSort,
  };
}
