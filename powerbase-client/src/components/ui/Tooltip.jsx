import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

export function Tooltip({
  text,
  children,
  className = 'left-0 top-0',
  position = 'left',
}) {
  return (
    <>
      <div className="group relative not-sr-only">
        <div
          className={cn(
            'hidden absolute top-1 items-center group-hover:flex',
            className,
          )}
        >
          {position === 'right' && <div className="transform w-2 h-2 rotate-45 bg-gray-900" />}
          <div
            className={cn(
              'bg-gray-900 shadow-lg rounded p-2 text-xs leading-none text-white whitespace-no-wrap',
              position === 'left' ? '-mr-1' : '-ml-1',
            )}
          >
            {text}
          </div>
          {position === 'left' && <div className="transform w-2 h-2 rotate-45 bg-gray-900" />}
        </div>
        {children}
      </div>
      <div className="sr-only">{text}</div>
    </>
  );
}

Tooltip.propTypes = {
  text: PropTypes.string.isRequired,
  children: PropTypes.any.isRequired,
  className: PropTypes.string,
  position: PropTypes.oneOf(['left', 'right']),
};
