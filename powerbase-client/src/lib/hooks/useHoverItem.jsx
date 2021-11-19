import { useState } from 'react';

export function useHoverItem() {
  const [hoveredItem, setHoveredItem] = useState();

  const handleMouseEnter = (item) => setHoveredItem(item);
  const handleMouseLeave = () => setHoveredItem(undefined);

  return {
    hoveredItem,
    setHoveredItem,
    handleMouseEnter,
    handleMouseLeave,
  };
}
