import React from 'react';
import PropTypes from 'prop-types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableItem({
  as = 'div',
  id,
  children,
  handle,
  dragging,
  ...props
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = (dragging == null || dragging)
    ? {
      transform: CSS.Transform.toString({
        ...transform,
        scaleX: 1,
        scaleY: 1,
      }),
      transition,
    }
    : {};

  const handleComponent = handle && handle.position && handle.component
    ? (
      <div {...listeners} className={handle?.className}>
        {handle?.component}
      </div>
    )
    : null;

  const childNodes = (
    <>
      {handle?.position === 'left' && handleComponent}
      {children}
      {handle?.position === 'right' && handleComponent}
    </>
  );

  return React.createElement(
    as,
    {
      ref: setNodeRef,
      style,
      ...attributes,
      ...(handle?.position ? {} : listeners),
      ...props,
    },
    childNodes,
  );
}

SortableItem.propTypes = {
  as: PropTypes.string,
  id: PropTypes.any.isRequired,
  handle: PropTypes.object,
  dragging: PropTypes.bool,
  children: PropTypes.any.isRequired,
};
