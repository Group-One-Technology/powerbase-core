import React from 'react';
import PropTypes from 'prop-types';
import { Spinner } from './Spinner';

export const Button = React.forwardRef(({
  children,
  loading,
  disabled,
  ...props
}, ref) => (
  <button ref={ref} disabled={disabled || loading} {...props}>
    {children}
    {loading && (
      <>
        <span className="sr-only">Loading.</span>
        <Spinner className="h-4 w-4 ml-1 text-current" />
      </>
    )}
  </button>
));

Button.propTypes = {
  children: PropTypes.any.isRequired,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
};
