import React from 'react';
import PropTypes from 'prop-types';

export function GripVerticalIcon({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      xmlSpace="preserve"
      fill="currentColor"
    >
      <g>
        <path d="M191.7,31h-64.3c-17.7,0-32.1,14.4-32.1,32.1v64.3c0,17.7,14.4,32.1,32.1,32.1h64.3c17.7,0,32.1-14.4,32.1-32.1V63.1
          C223.9,45.4,209.5,31,191.7,31z M191.7,191.7h-64.3c-17.7,0-32.1,14.4-32.1,32.1v64.3c0,17.7,14.4,32.1,32.1,32.1h64.3
          c17.7,0,32.1-14.4,32.1-32.1v-64.3C223.9,206.1,209.5,191.7,191.7,191.7z M191.7,352.4h-64.3c-17.7,0-32.1,14.4-32.1,32.1v64.3
          c0,17.7,14.4,32.1,32.1,32.1h64.3c17.7,0,32.1-14.4,32.1-32.1v-64.3C223.9,366.8,209.5,352.4,191.7,352.4z M384.6,31h-64.3
          c-17.7,0-32.1,14.4-32.1,32.1v64.3c0,17.7,14.4,32.1,32.1,32.1h64.3c17.7,0,32.1-14.4,32.1-32.1V63.1C416.7,45.4,402.3,31,384.6,31
          z M384.6,191.7h-64.3c-17.7,0-32.1,14.4-32.1,32.1v64.3c0,17.7,14.4,32.1,32.1,32.1h64.3c17.7,0,32.1-14.4,32.1-32.1v-64.3
          C416.7,206.1,402.3,191.7,384.6,191.7z M384.6,352.4h-64.3c-17.7,0-32.1,14.4-32.1,32.1v64.3c0,17.7,14.4,32.1,32.1,32.1h64.3
          c17.7,0,32.1-14.4,32.1-32.1v-64.3C416.7,366.8,402.3,352.4,384.6,352.4z"
        />
      </g>
    </svg>
  );
}

GripVerticalIcon.propTypes = {
  className: PropTypes.string,
};
