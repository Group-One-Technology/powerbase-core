import React, {
  useEffect,
  useState,
  forwardRef,
  useRef,
} from 'react';
import PropTypes from 'prop-types';
import { isObject } from '@lib/helpers/isObject';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@css/react-datepicker.css';

function getValue(value) {
  if (isObject(value)) return JSON.stringify(value);
  if (value && value.toString) return value.toString();
  if (value === null) return '';
  if (value === undefined) return '';
  return value;
}

const TooltipContent = () => (
  <div className="flex">
    <div className="relative mx-2">
      <div className="bg-black text-white text-xs rounded-sm py-1 px-4 right-0 bottom-full">
        Enter a valid email
        <svg
          className="absolute text-black h-2 w-full left-0 top-full"
          x="0px"
          y="0px"
          viewBox="0 0 255 255"
          xmlSpace="preserve"
        >
          <polygon
            className="fill-current"
            points="0,0 127.5,127.5 255,0"
          />
        </svg>
      </div>
    </div>
  </div>
);

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

const Calendar = ({ onClickOutsideEditingCell }) => {
  const [startDate, setStartDate] = useState(new Date());

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
    const formatted = formatDate(date);
    await onClickOutsideEditingCell(formatted);
  };

  return (
    <DatePicker
      selected={startDate}
      value={startDate}
      onChange={(date) => handleChange(date)}
      customInput={<CustomInput />}
      timeInputLabel="Time:"
      dateFormat="MM/dd/yyyy h:mm aa"
      portalId="root-portal"
      showYearDropdown
      dropdownMode="select"
      showTimeSelect
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
  onClickOutsideEditingCell: PropTypes.func.isRequired,
};

CalButton.propTypes = {
  value: PropTypes.any,
  onClick: PropTypes.func.isRequired,
};

CustomInput.propTypes = {
  value: PropTypes.any,
  onClick: PropTypes.func.isRequired,
};

function TextCell(
  {
    isEditing,
    onChange,
    value,
    validationToolTip,
    fieldType,
    setCalendarValue,
    onClickOutsideEditingCell,
  },
  ref,
) {
  useEffect(() => {
    if (fieldType.dataType !== 'date') ref.current.focus();
  }, []);
  const cellInnerEl = isEditing ? (
    <TooltipPrimitive.Root delayDuration={0} open={validationToolTip}>
      <TooltipPrimitive.Trigger className="w-full h-full">
        {fieldType.dataType === 'date' ? (
          <Calendar
            setCalendarValue={setCalendarValue}
            onClickOutsideEditingCell={onClickOutsideEditingCell}
          />
        ) : (
          <input
            value={getValue(value)}
            className="w-full focus:outline-none text-sm leading-3"
            onChange={(newVal) => {
              if (isObject(value)) onChange(JSON.parse(newVal));
              else onChange(newVal);
            }}
            ref={ref}
          />
        )}
        <TooltipPrimitive.Content side="top">
          <TooltipContent />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Trigger>
    </TooltipPrimitive.Root>
  ) : (
    getValue(value)
  );
  return cellInnerEl;
}

TextCell.propTypes = {
  value: PropTypes.any,
  isEditing: PropTypes.bool,
  validationToolTip: PropTypes.bool,
  onChange: PropTypes.func,
  fieldType: PropTypes.object,
  setCalendarValue: PropTypes.func,
  onClickOutsideEditingCell: PropTypes.func,
};

export default React.forwardRef(TextCell);
