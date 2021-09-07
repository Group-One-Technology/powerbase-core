import React from 'react';
import PropTypes from 'prop-types';
import { Spinner } from './Spinner';

export function Button({
  children,
  loading,
  disabled,
  ...props
}) {
  return (
    <button disabled={disabled || loading} {...props}>
      {loading && (
        <>
          <span className="sr-only">Loading.</span>
          <Spinner />
        </>
      )}
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.any.isRequired,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
};
