import React from 'react';
import PropTypes from 'prop-types';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export function DraggableItem({
  id,
  data,
  children,
  Component,
  ...props
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({ id, data });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  if (Component) {
    return (
      <Component ref={setNodeRef} style={style} {...listeners} {...attributes} {...props}>
        {children}
      </Component>
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} {...props}>
      {children}
    </div>
  );
}

DraggableItem.propTypes = {
  id: PropTypes.any.isRequired,
  data: PropTypes.object,
  children: PropTypes.any,
  Component: PropTypes.any,
};
