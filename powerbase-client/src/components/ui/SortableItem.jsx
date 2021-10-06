import React from 'react';
import PropTypes from 'prop-types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableItem({
  as = 'div',
  id,
  children,
  ...props
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString({
      ...transform,
      scaleX: 1,
      scaleY: 1,
    }),
    transition,
  };

  return React.createElement(
    as,
    {
      ref: setNodeRef,
      style,
      ...attributes,
      ...listeners,
      ...props,
    },
    children,
  );
}

SortableItem.propTypes = {
  as: PropTypes.string,
  id: PropTypes.any.isRequired,
  children: PropTypes.any.isRequired,
};
