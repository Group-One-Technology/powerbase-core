import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import RelativePortal from 'react-relative-portal';

import { useDidMountEffect } from '@lib/hooks/useDidMountEffect';
import { FieldType } from '@lib/constants/field-types';

export function CellInput({
  field,
  fieldType,
  value: initialValue,
  onValueChange,
  onSubmit,
  isAddRecord,
  className,
  style,
}) {
  const rootInputRef = useRef();
  const inputRef = useRef();
  const [value, setValue] = useState(initialValue);
  const [focus, setFocus] = useState(!isAddRecord);

  const updateValue = (updatedValue) => {
    setValue(updatedValue);
    if (onValueChange) onValueChange(field.fieldId, updatedValue);
  };

  const handleBlur = () => {
    setFocus(false);
    if (onSubmit) onSubmit(value);
  };

  const handleKeyDown = (evt) => {
    if (evt.code === 'Enter' && onSubmit) onSubmit(value);

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
    setValue(initialValue);
    if (onSubmit) setFocus(true);
    if ([FieldType.LONG_TEXT, FieldType.JSON_TEXT].includes(fieldType.name)) {
      inputRef.current?.focus();
    }
  }, [initialValue, onSubmit]);

  useDidMountEffect(() => {
    if ([FieldType.LONG_TEXT, FieldType.JSON_TEXT].includes(fieldType.name) && focus) {
      inputRef.current?.focus();
    }
  }, [focus]);

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
            className="py-1 px-2 h-4 w-4  focus:ring-indigo-500 border-gray-300 rounded"
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
          <RelativePortal
            component="div"
            top={0}
            left={0}
          >
            {focus && (
              <textarea
                ref={inputRef}
                name={field.name}
                onChange={(evt) => updateValue(evt.target.value)}
                className={cn(
                  'absolute text-sm items-center py-1 px-2 border border-indigo-500',
                  isAddRecord && 'bg-green-50',
                  className,
                )}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                value={value}
                rows={3}
                style={{ width: style?.width, height: 'auto' }}
              />
            )}
          </RelativePortal>
        </>
      );
    default: {
      let type = 'text';
      let curValue = value;

      if (fieldType.name === FieldType.NUMBER || fieldType.name === FieldType.PERCENT || fieldType.name === FieldType.CURRENCY) {
        type = 'number';
        if (curValue != null) curValue = Number(curValue);
      } else if (fieldType.name === FieldType.URL) {
        type = 'url';
        if (curValue != null) curValue = String(curValue);
      } else if (fieldType.name === FieldType.EMAIL) {
        type = 'email';
        if (curValue != null) curValue = String(curValue);
      }

      if (curValue == null) curValue = '';

      return (
        <input
          ref={inputRef}
          type={type}
          name={field.name}
          value={value}
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
      );
    }
  }
}

CellInput.propTypes = {
  field: PropTypes.object.isRequired,
  fieldType: PropTypes.object.isRequired,
  value: PropTypes.any,
  onValueChange: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  isAddRecord: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};
