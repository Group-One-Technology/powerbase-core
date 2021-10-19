import { useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { useViewFields } from '@models/ViewFields';
import { useSaveStatus } from '@models/SaveStatus';
import { reorderViewFields } from '@lib/api/view-fields';
import { useSensors } from '@lib/hooks/dnd-kit/useSensors';
import { useMounted } from '@lib/hooks/useMounted';

/**
 * Handles the reordering logic of the fields/columns.
 * @param {number} tableId
 * @param {array} fields
 * @param {function} setFields
 * @returns { sensors, dragging, handleDragStart, handleDragMove, handleDragEnd }
 */
export function useReorderFields({ tableId, fields, setFields }) {
  const { mounted } = useMounted();
  const { saving, saved, catchError } = useSaveStatus();
  const { data: remoteFields, mutate: mutateViewFields } = useViewFields();
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
      saving();

      const hiddenFields = remoteFields.filter((item) => item.isHidden);
      const updatedFields = arrayMove(fields, oldIndex, newIndex < oldIndex ? newIndex + 1 : newIndex);

      try {
        setFields(updatedFields);
        await reorderViewFields({
          tableId,
          viewFields: [...updatedFields.map((item) => item.id), ...hiddenFields.map((item) => item.id)],
        });
        mounted(() => setDragging(null));
        await mutateViewFields();
        saved();
      } catch (err) {
        catchError(err);
        mounted(() => setDragging(null));
      }
    }
  };

  return {
    sensors,
    dragging,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
}
