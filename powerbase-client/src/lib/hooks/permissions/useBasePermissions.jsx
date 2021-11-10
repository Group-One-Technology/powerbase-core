import { useState, useEffect } from 'react';
import { CUSTOM_PERMISSIONS } from '@lib/constants/permissions';

function intializeBasePermissions(permissions) {
  return CUSTOM_PERMISSIONS.Base
    .map((item) => ({
      ...item,
      value: permissions != null
        ? permissions[item.key] ?? item.value
        : item.value ?? false,
    }))
    .map((item) => ({ [item.key]: item.value }))
    .reduce((acc, cur) => ({ ...acc, ...cur }), {});
}

export function useBasePermissions({ base, guest, permissions }) {
  const [basePermissions, setBasePermissions] = useState(intializeBasePermissions(permissions));

  useEffect(() => {
    setBasePermissions(intializeBasePermissions(permissions));
  }, [base, guest]);

  const handleBasePermissionsToggle = (selectedItem) => {
    setBasePermissions({
      ...basePermissions,
      [selectedItem.key]: !basePermissions[selectedItem.key],
    });
  };

  return {
    basePermissions,
    handleBasePermissionsToggle,
  };
}
