import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { Spinner } from './Spinner';

export function Loader({ className, style }) {
  return (
    <div className={cn('w-full flex items-center justify-center', className)} style={style}>
      <Spinner className="h-8 w-8 text-current" />
    </div>
  );
}

Loader.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
};
