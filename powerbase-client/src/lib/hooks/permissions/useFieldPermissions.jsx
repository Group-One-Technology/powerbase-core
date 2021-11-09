import useSWR from 'swr';
import { useState, useEffect } from 'react';

import { useAuthUser } from '@models/AuthUser';
import { getTableFields } from '@lib/api/fields';
import { CUSTOM_PERMISSIONS } from '@lib/constants/permissions';

export function useFieldPermissions({ table }) {
  const { authUser } = useAuthUser();

  const { data: fields } = useSWR(
    (table?.id && authUser) ? `/tables/${table?.id}/fields` : null,
    () => (table?.id
      ? getTableFields({ tableId: table.id })
      : undefined),
  );

  const [field, setField] = useState();
  const [fieldPermissions, setFieldPermissions] = useState(CUSTOM_PERMISSIONS.Field.map((item) => ({
    ...item,
    enabled: false,
  })));

  useEffect(() => {
    setFieldPermissions(CUSTOM_PERMISSIONS.Field.map((item) => ({
      ...item,
      enabled: false,
    })));
  }, [table]);

  useEffect(() => {
    if (table && fields?.length) {
      setField(fields[0]);
    }
  }, [fields, table]);

  const handleFieldPermissionsToggle = (selectedItem) => {
    setFieldPermissions(fieldPermissions.map((item) => ({
      ...item,
      enabled: item.name === selectedItem.name
        ? !item.enabled
        : item.enabled,
    })));
  };

  return {
    field,
    setField,
    fields,
    fieldPermissions,
    handleFieldPermissionsToggle,
  };
}
