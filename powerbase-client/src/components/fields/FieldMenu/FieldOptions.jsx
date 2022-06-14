import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { CogIcon, ChevronRightIcon } from '@heroicons/react/outline';

import { useSaveStatus } from '@models/SaveStatus';
import { useBaseUser } from '@models/BaseUser';
import { useViewFieldState } from '@models/view/ViewFieldState';
import { useTableRecords } from '@models/TableRecords';
import { PERMISSIONS } from '@lib/constants/permissions';
import {
  disableFieldValidation,
  enableFieldValidation,
  setFieldAsPII,
  unsetFieldAsPII,
  setFieldAsNullable,
  unsetFieldAsNullable,
} from '@lib/api/fields';
import { captureError } from '@lib/helpers/captureError';
import { useLayer } from 'react-laag';

export function FieldOptions({
  table,
  field,
  close,
}) {
  const { baseUser } = useBaseUser();
  const { saving, catchError, saved } = useSaveStatus();
  const { fields, setFields, mutateViewFields } = useViewFieldState();
  const { mutate: mutateTableRecords } = useTableRecords();

  const [isOpen, setIsOpen] = useState(false);

  const { renderLayer, triggerProps, layerProps } = useLayer({
    isOpen,
    placement: 'right-center',
    onParentClose: () => setIsOpen(false),
  });

  const canManageField = baseUser?.can(PERMISSIONS.ManageField, field);
  const canSetPII = (canManageField && table.hasPrimaryKey && (field.isPii || !field.isPrimaryKey));

  if (!canManageField) return null;

  const handleToggleValidation = async () => {
    saving();

    const updatedFields = fields.map((item) => ({
      ...item,
      hasValidation: item.id === field.id
        ? !field.hasValidation
        : item.hasValidation,
    }));

    setFields(updatedFields);
    close();

    try {
      if (!field.hasValidation) {
        await enableFieldValidation({ id: field.fieldId });
      } else {
        await disableFieldValidation({ id: field.fieldId });
      }

      await mutateViewFields(updatedFields);
      saved();
    } catch (err) {
      catchError(err);
    }
  };

  const handleTogglePII = async () => {
    if (!canSetPII) return;
    saving();

    const currentFields = fields;
    const updatedFields = currentFields.map((item) => ({
      ...item,
      isPII: item.id === field.id
        ? !field.isPii
        : item.isPii,
    }));

    setFields(updatedFields);
    close();

    try {
      if (!field.isPii) {
        await setFieldAsPII({ id: field.fieldId });
      } else {
        await unsetFieldAsPII({ id: field.fieldId });
      }

      await mutateViewFields(updatedFields);
      await mutateTableRecords();
      saved();
    } catch (err) {
      setFields(currentFields);
      catchError(err);
    }
  };

  const handleToggleNullable = async () => {
    saving();

    const currentFields = fields;
    const updatedFields = currentFields.map((item) => ({
      ...item,
      isNullable: item.id === field.id
        ? !field.isNullable
        : item.isNullable,
    }));

    setFields(updatedFields);
    close();

    try {
      if (!field.isNullable) {
        await setFieldAsNullable({ id: field.fieldId });
      } else {
        await unsetFieldAsNullable({ id: field.fieldId });
      }

      await mutateViewFields(updatedFields);
      saved();
    } catch (err) {
      setFields(currentFields);
      captureError(err);
      catchError(err);
    }
  };

  return (
    <>
      <button
        {...triggerProps}
        type="button"
        className="px-4 py-1 w-full text-sm cursor-pointer flex items-center hover:bg-gray-100 focus:bg-gray-100"
        onClick={() => setIsOpen((state) => !state)}
      >
        <CogIcon className="h-4 w-4 mr-1.5" />
        Options
        <ChevronRightIcon className="ml-auto h-4 w-4" />
      </button>
      {isOpen && renderLayer((
        <div {...layerProps} className="py-2 flex flex-col overflow-hidden rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 w-60">
          <button
            type="button"
            className="px-4 py-1 w-full text-sm cursor-pointer flex items-center hover:bg-gray-100 focus:bg-gray-100"
            onClick={handleToggleValidation}
          >
            {!field.hasValidation ? 'Enable Validation' : 'Disable Validation'}
          </button>
          {canSetPII && (
            <button
              type="button"
              className="px-4 py-1 w-full text-sm cursor-pointer flex items-center hover:bg-gray-100 focus:bg-gray-100"
              onClick={handleTogglePII}
            >
              {!field.isPii ? 'Set as PII' : 'Unset as PII'}
            </button>
          )}
          <button
            type="button"
            className="px-4 py-1 w-full text-sm cursor-pointer flex items-center hover:bg-gray-100 focus:bg-gray-100"
            onClick={handleToggleNullable}
          >
            {!field.isNullable ? 'Allow Null' : 'Set as Required'}
          </button>
        </div>
      ))}
    </>
  );
}

FieldOptions.propTypes = {
  table: PropTypes.object.isRequired,
  field: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired,
};
