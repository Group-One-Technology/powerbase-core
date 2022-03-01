import React from 'react';
import PropTypes from 'prop-types';
import * as ContextMenu from '@radix-ui/react-context-menu';
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

export function FieldOptions({ table, field, setOpen }) {
  const { baseUser } = useBaseUser();
  const { saving, catchError, saved } = useSaveStatus();
  const { fields, setFields, mutateViewFields } = useViewFieldState();
  const { mutate: mutateTableRecords } = useTableRecords();

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

    setOpen(false);
    setFields(updatedFields);

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
    setOpen(false);

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
    setOpen(false);

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
      catchError(err);
    }
  };

  return (
    <ContextMenu.Root>
      <ContextMenu.TriggerItem className="px-4 py-1 text-sm cursor-pointer flex items-center hover:bg-gray-100 focus:bg-gray-100">
        <CogIcon className="h-4 w-4 mr-1.5" />
        Options
        <ChevronRightIcon className="ml-auto h-4 w-4" />
      </ContextMenu.TriggerItem>
      <ContextMenu.Content sideOffset={2} alignOffset={-8} className="py-2 block overflow-hidden rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 w-60">
        <ContextMenu.Item
          className="px-4 py-1 text-sm cursor-pointer flex items-center hover:bg-gray-100 focus:bg-gray-100"
          onSelect={handleToggleValidation}
        >
          {!field.hasValidation ? 'Enable Validation' : 'Disable Validation'}
        </ContextMenu.Item>
        {canSetPII && (
          <ContextMenu.Item
            className="px-4 py-1 text-sm cursor-pointer flex items-center hover:bg-gray-100 focus:bg-gray-100"
            onSelect={handleTogglePII}
          >
            {!field.isPii ? 'Set as PII' : 'Unset as PII'}
          </ContextMenu.Item>
        )}
        <ContextMenu.Item
          className="px-4 py-1 text-sm cursor-pointer flex items-center hover:bg-gray-100 focus:bg-gray-100"
          onSelect={handleToggleNullable}
        >
          {!field.isNullable ? 'Allow Null' : 'Set as Required'}
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

FieldOptions.propTypes = {
  table: PropTypes.object.isRequired,
  field: PropTypes.object.isRequired,
  setOpen: PropTypes.func.isRequired,
};
