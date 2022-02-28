import React from 'react';
import PropTypes from 'prop-types';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { CogIcon, ChevronRightIcon } from '@heroicons/react/outline';

import { useSaveStatus } from '@models/SaveStatus';
import { useBaseUser } from '@models/BaseUser';
import { PERMISSIONS } from '@lib/constants/permissions';
import { disableFieldValidation, enableFieldValidation } from '@lib/api/fields';
import { useViewFieldState } from '@models/view/ViewFieldState';

export function FieldOptions({ field, setOpen }) {
  const { baseUser } = useBaseUser();
  const { saving, catchError, saved } = useSaveStatus();
  const { fields, setFields, mutateViewFields } = useViewFieldState();

  const canManageField = baseUser?.can(PERMISSIONS.ManageField, field);

  const handleToggleValidation = async () => {
    if (!canManageField) return;
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
      catchError(err.response.data.error || err.response.data.exception);
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
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

FieldOptions.propTypes = {
  field: PropTypes.object.isRequired,
  setOpen: PropTypes.func.isRequired,
};
