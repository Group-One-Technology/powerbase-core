import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { Spinner } from './Spinner';

export const Button = React.forwardRef(({
  children,
  loading,
  className,
  disabled,
  ...props
}, ref) => (
  <button ref={ref} className={className} disabled={disabled || loading} {...props}>
    {!loading && children}
    {loading && (
      <>
        <span className={cn('invisible !p-0 !m-0 !border-none', className)}>{children}</span>
        <span className="sr-only">Loading.</span>
        <Spinner className="absolute h-4 w-4 ml-1 text-current" />
      </>
    )}
  </button>
));

Button.propTypes = {
  children: PropTypes.any.isRequired,
  className: PropTypes.string,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
};
