import { arrayMove } from '@dnd-kit/sortable';
import { useBaseUser } from '@models/BaseUser';
import { reorderTables } from '@lib/api/tables';
import { useSensors } from '@lib/hooks/dnd-kit/useSensors';
import { PERMISSIONS } from '@lib/constants/permissions';

export function useTableTabsReorder({ base, setTables }) {
  const { baseUser } = useBaseUser();

  const sensors = useSensors({
    keyboard: false,
    mouse: {
      activationConstraint: {
        distance: 5,
      },
    },
  });

  const handleReorderViews = ({ active, over }) => {
    if (active.id !== over.id && baseUser?.can(PERMISSIONS.ManageBase, base.id)) {
      setTables((prevViews) => {
        const oldIndex = prevViews.findIndex((item) => item.id === active.id);
        const newIndex = prevViews.findIndex((item) => item.id === over.id);
        const updatedTables = arrayMove(prevViews, oldIndex, newIndex).map((item, index) => ({
          ...item,
          order: index,
        }));
        reorderTables({ databaseId: base.id, tables: updatedTables });
        return updatedTables;
      });
    }
  };

  return { sensors, handleReorderViews };
}
