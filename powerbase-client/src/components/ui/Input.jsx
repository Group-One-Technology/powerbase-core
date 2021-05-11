import React from 'react';
import PropTypes from 'prop-types';

export function Input(props) {
  return (
    <input
      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      {...props}
    />
  );
}

Input.propTypes = {
  id: PropTypes.string,
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  autoComplete: PropTypes.string,
  required: PropTypes.bool,
}
