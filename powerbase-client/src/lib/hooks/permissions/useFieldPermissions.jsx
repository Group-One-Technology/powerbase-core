import useSWR from 'swr';
import { useEffect } from 'react';

import { useAuthUser } from '@models/AuthUser';
import { getTableFields } from '@lib/api/fields';
import { CUSTOM_PERMISSIONS } from '@lib/constants/permissions';

function initializeFieldPermissions(initialFieldPermissions, fields, permissions) {
  const fieldPermissions = {};

  fields?.forEach((field) => {
    fieldPermissions[field.id] = CUSTOM_PERMISSIONS.Field
      .map((item) => ({
        ...item,
        value: permissions?.fields && permissions.fields[field.id] != null
          ? permissions.fields[field.id][item.key] ?? item.value
          : item.value ?? false,
      }))
      .map((item) => ({ [item.key]: item.value }))
      .reduce((acc, cur) => ({ ...acc, ...cur }), {});
  });

  if (typeof initialFieldPermissions === 'object') {
    Object.keys(initialFieldPermissions).forEach((key) => {
      if (fieldPermissions[key] == null) {
        fieldPermissions[key] = initialFieldPermissions[key];
      }
    });
  }

  return fieldPermissions;
}

export function useFieldPermissions({
  guest,
  fieldPermissions,
  setFieldPermissions,
  table,
  permissions,
  canToggleAccess,
}) {
  const { authUser } = useAuthUser();

  const { data: fields } = useSWR(
    (table?.id && authUser) ? `/tables/${table?.id}/fields` : null,
    () => (table?.id
      ? getTableFields({ tableId: table.id })
      : undefined),
  );

  useEffect(() => {
    setFieldPermissions(initializeFieldPermissions(fieldPermissions, fields, permissions));
  }, [guest, fields]);

  const handleFieldPermissionsToggle = async (field, selectedItem) => {
    if (canToggleAccess) {
      const updatedFieldPermission = {
        ...fieldPermissions,
        [field.id]: {
          ...fieldPermissions[field.id],
          [selectedItem.key]: fieldPermissions[field.id]?.[selectedItem.key] != null
            ? !fieldPermissions[field.id][selectedItem.key]
            : !selectedItem.value,
        },
      };

      setFieldPermissions(updatedFieldPermission);
    }
  };

  return {
    fields,
    fieldPermissions,
    handleFieldPermissionsToggle,
  };
}
