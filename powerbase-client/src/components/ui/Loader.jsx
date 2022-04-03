import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { Spinner } from './Spinner';

export function Loader({ className, label, ...props }) {
  return (
    <div className={cn('w-full flex items-center justify-center', className)} {...props}>
      <Spinner className="h-8 w-8 text-current" />
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
}

Loader.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string,
};
