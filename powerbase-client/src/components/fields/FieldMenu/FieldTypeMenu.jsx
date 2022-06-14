import React, { useState } from 'react';
import { useLayer } from 'react-laag';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { ChevronRightIcon } from '@heroicons/react/outline';

import { useFieldTypes } from '@models/FieldTypes';
import { useSaveStatus } from '@models/SaveStatus';
import { useViewFieldState } from '@models/view/ViewFieldState';
import { updateFieldType } from '@lib/api/fields';
import { captureError } from '@lib/helpers/captureError';
import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';

export function FieldTypeMenu({
  field,
  fieldType,
  canManageField,
  close,
}) {
  const { data: fieldTypes } = useFieldTypes();
  const { fields, setFields, mutateViewFields } = useViewFieldState();
  const { saving, catchError, saved } = useSaveStatus();

  const [isOpen, setIsOpen] = useState(false);

  const relatedFieldTypes = fieldTypes.filter((item) => item.dataType === fieldType.dataType);
  const isFieldTypeConvertable = relatedFieldTypes.length > 1 && !(field.dbType && ['uuid', 'int', 'integer'].includes(field.dbType));

  const { renderLayer, triggerProps, layerProps } = useLayer({
    isOpen,
    placement: 'right-center',
    onParentClose: () => setIsOpen(false),
  });

  const handleFieldTypeChange = async (selectedFieldType) => {
    if (!canManageField) return;
    saving();

    const oldFields = [...fields];
    const updatedFields = fields.map((item) => ({
      ...item,
      fieldTypeId: item.id === field.id
        ? selectedFieldType.id
        : item.fieldTypeId,
    }));

    setFields(updatedFields);
    close();

    try {
      await updateFieldType({ id: field.fieldId, fieldTypeId: selectedFieldType.id });
      await mutateViewFields(updatedFields);
      saved();
    } catch (err) {
      setFields(oldFields);
      captureError(err);
      catchError(err);
    }
  };

  if (isFieldTypeConvertable && canManageField) {
    return (
      <>
        <button
          {...triggerProps}
          type="button"
          className="px-4 py-1 w-full text-sm cursor-pointer flex items-center text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
          onClick={() => setIsOpen((state) => !state)}
        >
          <FieldTypeIcon fieldType={fieldType} className="mr-1.5" />
          {fieldType.name}
          <ChevronRightIcon className="ml-auto h-4 w-4" />
        </button>
        {isOpen && renderLayer((
          <div {...layerProps} className="py-2 flex flex-col overflow-hidden rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 w-60">
            {relatedFieldTypes.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  'px-4 py-1 w-full text-sm flex items-center hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
                  item.id === field.fieldTypeId ? 'cursor-not-allowed bg-gray-100' : 'cursor-pointer',
                )}
                onClick={() => handleFieldTypeChange(item)}
                disabled={item.id === field.fieldTypeId}
              >
                <FieldTypeIcon className="mr-1.5" fieldType={item} />
                {item.name}
              </button>
            ))}
          </div>
        ))}
      </>
    );
  }

  return (
    <span className="px-4 py-1 text-sm flex items-center text-gray-900">
      <FieldTypeIcon fieldType={fieldType} className="mr-1.5" />
      {fieldType.name}
    </span>
  );
}

FieldTypeMenu.propTypes = {
  field: PropTypes.object.isRequired,
  fieldType: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired,
  canManageField: PropTypes.bool,
};
