import React from 'react';
import PropTypes from 'prop-types';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { TrashIcon } from '@heroicons/react/outline';

import { useSaveStatus } from '@models/SaveStatus';
import { useViewFieldState } from '@models/view/ViewFieldState';
import { dropField } from '@lib/api/fields';

export function FieldMenuDrop({ field, setConfirmModal }) {
  const { saving, catchError, saved } = useSaveStatus();
  const { fields, setFields, mutateViewFields } = useViewFieldState();

  const handleConfirmDropField = async () => {
    if (!field || !fields.length) return;

    saving();
    const updatedFields = fields.filter((item) => item.id !== field.id);
    setFields(updatedFields);

    try {
      await dropField({ fieldId: field.fieldId });
      setConfirmModal({ open: false });
      mutateViewFields(updatedFields);
      saved();
    } catch (err) {
      setConfirmModal({ open: false });
      setFields(fields);
      catchError(err);
    }
  };

  const handleDropField = () => {
    setConfirmModal({
      open: true,
      title: 'Drop Field',
      description: `Are you sure you want to drop "${field.alias}" field? This action cannot be undone.`,
      onConfirm: handleConfirmDropField,
    });
  };

  return (
    <ContextMenu.Item
      className="px-4 py-1 text-sm flex items-center cursor-pointer hover:bg-gray-100 focus:bg-gray-100"
      onSelect={handleDropField}
    >
      <TrashIcon className="h-4 w-4 mr-1.5" />
      Drop Field
    </ContextMenu.Item>
  );
}

FieldMenuDrop.propTypes = {
  field: PropTypes.object.isRequired,
  setConfirmModal: PropTypes.func.isRequired,
};
