import React, { useRef, useState } from 'react';
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
  isAddRecord,
  className,
  style,
}) {
  const rootInputRef = useRef();
  const inputRef = useRef();
  const [value, setValue] = useState(initialValue);
  const [focus, setFocus] = useState(false);

  const updateValue = (updatedValue) => {
    setValue(updatedValue);
    onValueChange(field.fieldId, updatedValue);
  };

  useDidMountEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useDidMountEffect(() => {
    if ((fieldType.name === FieldType.LONG_TEXT || fieldType.name === FieldType.JSON_TEXT) && focus) {
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
            onFocus={() => setFocus(true)}
            value={value}
            className={cn(
              'absolute text-sm items-center py-1 px-2 border-none',
              isAddRecord && 'bg-green-50',
              className,
            )}
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
                onBlur={() => setFocus(false)}
                onKeyDown={(evt) => {
                  // Add keyboard focus accessibility for tab and shift-tab
                  if (evt.code === 'Tab') {
                    evt.preventDefault();

                    if (evt.shiftKey) {
                      const focusableElements = rootInputRef.current?.parentElement.previousSibling.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                      focusableElements[0].focus();
                      setFocus(false);
                    } else {
                      const focusableElements = rootInputRef.current?.parentElement.nextSibling.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                      focusableElements[0].focus();
                      setFocus(false);
                    }
                  }
                }}
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
          className={cn(
            'h-full w-full text-sm items-center py-1 px-2 border-none',
            isAddRecord && 'bg-green-50',
            className,
          )}
        />
      );
    }
  }
}

CellInput.propTypes = {
  field: PropTypes.object.isRequired,
  fieldType: PropTypes.object.isRequired,
  value: PropTypes.any,
  onValueChange: PropTypes.func.isRequired,
  isAddRecord: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};
