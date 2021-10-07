import { useState } from 'react';

export function useReorderFields() {
  const [dragging, setDragging] = useState();

  const handleDragStart = (evt) => {
    setDragging(evt);
  };

  const handleDragEnd = (evt) => {
    console.log(evt);
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
