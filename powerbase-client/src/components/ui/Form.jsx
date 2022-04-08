import React from 'react';
import PropTypes from 'prop-types';

export function Form({ form = true, ...props }) {
  if (form) {
    return <form {...props} />;
  }

  return <div {...props} />;
}

Form.propTypes = {
  form: PropTypes.bool,
};
