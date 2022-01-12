import React, {
  useEffect,
  useState,
  forwardRef,
  useRef,
} from 'react';
import PropTypes from 'prop-types';
import { isObject } from '@lib/helpers/isObject';
import DatePicker from 'react-datepicker';
import { validateMagicValue } from '@lib/helpers/fields/validateMagicValue';
import '@css/react-datepicker.css';

function getValue(value) {
  if (isObject(value)) return JSON.stringify(value);
  if (value && value.toString) return value.toString();
  if (value === null) return '';
  if (value === undefined) return '';
  return value;
}

// TODO: Use Popover for displaying validation errors instead of tooltip
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

const CalButton = ({ onClick, value }) => {
  const buttonRef = useRef(null);
  useEffect(() => {
    buttonRef?.current?.click();
  }, []);
  return (
    <button
      className="w-full focus:outline-none text-sm leading-3"
      onClick={onClick}
      id="cal-button"
      ref={buttonRef}
    >
      {value}
    </button>
  );
};

const CustomInput = forwardRef(({ value, onClick }) => (
  <CalButton onClick={onClick} value={value} />
));

const Calendar = ({ defaultValue, handleExitCell }) => {
  const [startDate, setStartDate] = useState(new Date(defaultValue));

  const formatDate = (date) => {
    const year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(
      date,
    );
    const month = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(
      date,
    );
    const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);

    const time = new Intl.DateTimeFormat('en', {
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);

    const val = `${month}-${day}-${year} ${time}`;
    return val;
  };

  const handleChange = async (date) => {
    setStartDate(date);
    const formattedDate = formatDate(date);
    await handleExitCell(formattedDate);
  };

  return (
    <DatePicker
      selected={startDate}
      value={startDate}
      onChange={(date) => handleChange(date)}
      customInput={<CustomInput />}
      timeInputLabel="Time:"
      dateFormat="MM/dd/yyyy h:mm aa"
      portalId="root-portal-date-picker"
      dropdownMode="select"
      showYearDropdown
      showTimeInput
      popperModifiers={[
        {
          name: 'preventOverflow',
          options: {
            rootBoundary: 'viewport',
            tether: false,
            altAxis: true,
          },
        },
      ]}
    />
  );
};

Calendar.propTypes = {
  handleExitCell: PropTypes.func.isRequired,
  defaultValue: PropTypes.string,
};

CalButton.propTypes = {
  value: PropTypes.any,
  onClick: PropTypes.func.isRequired,
};

CustomInput.propTypes = {
  value: PropTypes.any,
  onClick: PropTypes.func,
};

function TextCell(
  {
    value: initialValue,
    field,
    fieldType,
    isEditing,
    handleExitCell,
    ...props
  },
  ref,
) {
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
        <Calendar
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
          if (evt.code === 'Enter') {
            if (!validateMagicValue(field, fieldType, value)) return;
            handleExitCell(value);
          }
        }}
        {...props}
      />
    );
  }

  return value;
}

TextCell.propTypes = {
  value: PropTypes.any,
  field: PropTypes.object.isRequired,
  isEditing: PropTypes.bool,
  fieldType: PropTypes.object,
  handleExitCell: PropTypes.func.isRequired,
};

export default React.forwardRef(TextCell);
