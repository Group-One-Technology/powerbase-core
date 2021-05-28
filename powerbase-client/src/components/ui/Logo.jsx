import React from 'react';
import PropTypes from 'prop-types';

export function Logo({
  white,
  className,
  ...props
}) {
  return (
    <img
      src={`/public/img/${white ? 'logo-white' : 'logo'}.svg`}
      alt="Powerbase logo"
      className={className}
      {...props}
    />
  );
}

Logo.propTypes = {
  white: PropTypes.bool,
  className: PropTypes.string.isRequired,
};
