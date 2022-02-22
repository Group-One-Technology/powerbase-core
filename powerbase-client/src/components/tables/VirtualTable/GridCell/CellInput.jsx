import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import RelativePortal from 'react-relative-portal';

import { useDidMountEffect } from '@lib/hooks/useDidMountEffect';
import { FieldType } from '@lib/constants/field-types';
import { useValidState } from '@lib/hooks/useValidState';
import { CELL_VALUE_VALIDATOR } from '@lib/validators/CELL_VALUE_VALIDATOR';

export function CellInput({
  field,
  fieldType,
  value: initialValue,
  onValueChange,
  onSubmit,
  isAddRecord,
  className,
  validate = true,
  style,
}) {
  const rootInputRef = useRef();
  const inputRef = useRef();
  const [value, setValue, { error }] = useValidState(
    initialValue,
    (curVal) => CELL_VALUE_VALIDATOR(curVal, fieldType.name, !field.isNullable),
  );
  const [focus, setFocus] = useState(!isAddRecord);

  const updateValue = (updatedValue) => {
    setValue(updatedValue);
    if (validate && error) return;
    if (onValueChange) onValueChange(field.fieldId, updatedValue);
  };

  const handleBlur = () => {
    setFocus(false);
    if (onSubmit) onSubmit(initialValue, value);
  };

  const handleKeyDown = (evt) => {
    if (evt.code === 'Enter' && !evt.shiftKey && onSubmit) onSubmit(initialValue, value);

    if ([FieldType.JSON_TEXT, FieldType.LONG_TEXT].includes(fieldType.name)) {
      // Add keyboard focus accessibility for tab and shift-tab
      if (evt.code === 'Tab') {
        evt.preventDefault();

        const focusableElementSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        if (evt.shiftKey) {
          setFocus(false);
          const focusableElements = rootInputRef.current?.parentElement.previousSibling.querySelectorAll(focusableElementSelector);
          if (focusableElements)focusableElements[0].focus();
        } else {
          setFocus(false);
          const focusableElements = rootInputRef.current?.parentElement.nextSibling.querySelectorAll(focusableElementSelector);
          if (focusableElements)focusableElements[0].focus();
        }
      }
    }
  };

  useEffect(() => {
    if (onSubmit) setFocus(true);
    if ([FieldType.LONG_TEXT, FieldType.JSON_TEXT].includes(fieldType.name)) {
      inputRef.current?.focus();
    }
  }, [onSubmit]);

  useDidMountEffect(() => {
    if ([FieldType.LONG_TEXT, FieldType.JSON_TEXT].includes(fieldType.name) && focus) {
      inputRef.current?.focus();
    }
  }, [focus]);

  const InputError = () => (validate && error
    ? (
      <p
        className="-ml-0.5 -mt-0.5 p-2 text-white text-xs bg-gray-900 border border-gray-900"
        style={{ width: style?.width }}
      >
        {error?.message}
      </p>
    ) : null);

  switch (fieldType.name) {
    case FieldType.CHECKBOX: {
      return (
        <div
          className={cn(
            'h-full w-full text-sm items-center py-1 px-2 text-indigo-600 border-none rounded',
            isAddRecord && 'bg-green-50',
            className,
          )}
        >
          <input
            ref={inputRef}
            type="checkbox"
            name={field.name}
            className="py-1 px-2 h-4 w-4 focus:ring-indigo-500 border-gray-300 rounded"
            checked={value?.toString() === 'true'}
            onChange={(evt) => updateValue(evt.target.checked)}
          />
        </div>
      );
    }
    case FieldType.JSON_TEXT:
    case FieldType.LONG_TEXT:
      return (
        <>
          <input
            ref={rootInputRef}
            value={value}
            onFocus={() => setFocus(true)}
            className={cn(
              'absolute text-sm items-center py-1 px-2 border-none',
              isAddRecord && 'bg-green-50',
              className,
            )}
            readOnly
          />
          <RelativePortal component="div" top={0} left={0}>
            {focus && (
              <>
                <textarea
                  ref={inputRef}
                  name={field.name}
                  onChange={(evt) => updateValue(evt.target.value)}
                  className={cn(
                    'text-sm items-center py-1 px-2 border border-indigo-500',
                    isAddRecord && 'bg-green-50',
                    className,
                  )}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  value={value}
                  rows={3}
                  style={{ width: style?.width, height: 'auto' }}
                />
                <InputError />
              </>
            )}
          </RelativePortal>
        </>
      );
    default: {
      let type = 'text';
      let curValue = value;

      if (fieldType.name === FieldType.URL) {
        type = 'url';
      } else if (fieldType.name === FieldType.EMAIL) {
        type = 'email';
      }

      if (curValue == null) curValue = '';

      return (
        <>
          <input
            ref={inputRef}
            type={type}
            name={field.name}
            value={curValue}
            onChange={(evt) => updateValue(evt.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={cn(
              'h-full w-full text-sm items-center py-1 px-2 border-none',
              isAddRecord && 'bg-green-50',
              className,
            )}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={focus}
          />
          {validate && error && (
            <RelativePortal component="div" top={0} left={0}>
              <InputError />
            </RelativePortal>
          )}
        </>
      );
    }
  }
}

CellInput.propTypes = {
  field: PropTypes.object.isRequired,
  fieldType: PropTypes.object.isRequired,
  value: PropTypes.any,
  onValueChange: PropTypes.func,
  onSubmit: PropTypes.func,
  isAddRecord: PropTypes.bool,
  className: PropTypes.string,
  validate: PropTypes.bool,
  style: PropTypes.object,
};
