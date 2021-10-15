import React from 'react';
import PropTypes from 'prop-types';
import { useDroppable } from '@dnd-kit/core';

export function DroppableArea({
  id,
  data,
  children,
  ...props
}) {
  const { setNodeRef } = useDroppable({ id, data });

  return (
    <div ref={setNodeRef} {...props}>
      {children}
    </div>
  );
}

DroppableArea.propTypes = {
  id: PropTypes.any.isRequired,
  data: PropTypes.object,
  children: PropTypes.any,
};
