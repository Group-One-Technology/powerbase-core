/* eslint-disable */
import React, { useEffect, Fragment, useState, forwardRef } from "react";
import isObject from "lodash/isObject";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function getValue(value) {
  if (isObject(value)) return JSON.stringify(value);
  if (value && value.toString) return value.toString();
  if (value === null) return "";
  if (value === undefined) return "";
  return value;
}

const TooltipContent = () => {
  return (
    <>
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
    </>
  );
};

const Calendar = ({ onClickOutsideEditingCell }) => {
  const [startDate, setStartDate] = useState(new Date());

  const formatDate = (date) => {
    const year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(
      date
    );
    const month = new Intl.DateTimeFormat("en", { month: "numeric" }).format(
      date
    );
    const day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date);

    const time = new Intl.DateTimeFormat("en", {
      hour: "numeric",
      minute: "numeric",
    }).format(date);

    // const formattedTime = time.split(" ")[0];

    const val = `${month}-${day}-${year} ${time}`;
    return val;
  };

  const handleChange = async (date) => {
    setStartDate(date);
    return await onClickOutsideEditingCell(formatDate(date));
  };

  const CustomInput = forwardRef(({ value, onClick, onChange }, ref) => (
    <input
      className="w-full focus:outline-none text-sm leading-3"
      onChange={onChange}
      value={value}
      ref={ref}
      onClick={onClick}
    />
  ));
  return (
    <DatePicker
      selected={startDate}
      value={startDate}
      onChange={(date) => handleChange(date)}
      customInput={<CustomInput />}
      timeInputLabel="Time:"
      dateFormat="MM/dd/yyyy h:mm aa"
      portalId="root-portal"
      showTimeInput
      popperModifiers={[
        {
          name: "preventOverflow",
          options: {
            rootBoundary: "viewport",
            tether: false,
            altAxis: true,
          },
        },
      ]}
    />
  );
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
  ref
) {
  useEffect(() => {
    if (fieldType.dataType !== "date") ref.current.focus();
  }, []);

  const cellInnerEl = isEditing ? (
    <TooltipPrimitive.Root delayDuration={0} open={validationToolTip}>
      <TooltipPrimitive.Trigger className="w-full h-full">
        {fieldType.dataType === "date" ? (
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

export default React.forwardRef(TextCell);
