import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { isObject } from '@lib/helpers/isObject';
import { EditCalendarCell } from './EditCalendarCell';

function getValue(value) {
  if (isObject(value)) return JSON.stringify(value);
  if (value && value.toString) return value.toString();
  if (value === null) return '';
  if (value === undefined) return '';
  return value;
}

// TODO: Use absolute positioned element for displaying validation errors instead of tooltip
// const TooltipContent = () => (
//   <div className="flex">
//     <div className="relative mx-2">
//       <div className="bg-black text-white text-xs rounded-sm py-1 px-4 right-0 bottom-full">
//         Enter a valid email
//         <svg
//           className="absolute text-black h-2 w-full left-0 top-full"
//           x="0px"
//           y="0px"
//           viewBox="0 0 255 255"
//           xmlSpace="preserve"
//         >
//           <polygon
//             className="fill-current"
//             points="0,0 127.5,127.5 255,0"
//           />
//         </svg>
//       </div>
//     </div>
//   </div>
// );

export const EditCell = React.forwardRef((
  {
    value: initialValue,
    field,
    fieldType,
    isEditing,
    handleExitCell,
    ...props
  },
  ref,
) => {
  const [value, setValue] = useState(getValue(initialValue));

  useEffect(() => {
    // eslint-disable-next-line react/destructuring-assignment
    if (fieldType.dataType !== 'date') ref.current.focus();
    setValue(getValue((initialValue)));
  }, [fieldType, initialValue]);

  const handleValueChange = (evt) => setValue(evt.target.value);

  if (isEditing) {
    if (fieldType.dataType === 'date') {
      return (
        <EditCalendarCell
          defaultValue={getValue(value)}
          handleExitCell={handleExitCell}
          {...props}
        />
      );
    }

    return (
      <input
        type="text"
        ref={ref}
        value={value}
        onChange={handleValueChange}
        className="text-sm items-center py-1 px-2 border border-indigo-500"
        onKeyDown={(evt) => {
          if (evt.code === 'Enter') handleExitCell(value);
        }}
        {...props}
      />
    );
  }

  return value;
});

EditCell.propTypes = {
  value: PropTypes.any,
  field: PropTypes.object.isRequired,
  isEditing: PropTypes.bool,
  fieldType: PropTypes.object,
  handleExitCell: PropTypes.func.isRequired,
};
