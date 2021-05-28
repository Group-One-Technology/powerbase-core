import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

export function FieldTypeIcon({ className }) {
  return (
    <span className={cn('text-sm font-medium text-gray-600', className)}>A</span>
  );
}

FieldTypeIcon.propTypes = {
  className: PropTypes.string,
};
