import { useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';

export function useReorderFields({ setFields }) {
  const [dragging, setDragging] = useState();

  const handleDragStart = (evt) => {
    setDragging(evt);
  };

  const handleDragEnd = ({ active, over }) => {
    const oldIndex = active.data.current.index;
    const newIndex = over.data.current.index;

    if (oldIndex !== newIndex && newIndex !== oldIndex - 1) {
      setFields((items) => arrayMove(items, oldIndex, newIndex < oldIndex ? newIndex + 1 : newIndex));
    }

    setDragging(null);
  };

  const handleDragMove = (evt) => {
    setDragging(evt);
  };

  return {
    dragging,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
}
