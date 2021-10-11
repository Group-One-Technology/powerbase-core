import { arrayMove } from '@dnd-kit/sortable';
import { updateTables } from '@lib/api/tables';
import { useSensors } from '@lib/hooks/dnd-kit/useSensors';

export function useTableTabsReorder({ base, setTables }) {
  const sensors = useSensors({
    keyboard: false,
    pointer: {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    },
  });

  const handleReorderViews = ({ active, over }) => {
    if (active.id !== over.id) {
      setTables((prevViews) => {
        const oldIndex = prevViews.findIndex((item) => item.id === active.id);
        const newIndex = prevViews.findIndex((item) => item.id === over.id);
        const updatedTables = arrayMove(prevViews, oldIndex, newIndex).map((item, index) => ({
          ...item,
          order: index,
        }));
        updateTables({ databaseId: base.id, tables: updatedTables });
        return updatedTables;
      });
    }
  };

  return { sensors, handleReorderViews };
}
