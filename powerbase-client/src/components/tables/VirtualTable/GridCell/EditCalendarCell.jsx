import React, {
  useEffect,
  useState,
  forwardRef,
  useRef,
} from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import '@css/react-datepicker.css';

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

export function EditCalendarCell({ defaultValue, handleExitCell }) {
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
}

EditCalendarCell.propTypes = {
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
