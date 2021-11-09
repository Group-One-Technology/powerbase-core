import { useState, useEffect } from 'react';
import { CUSTOM_PERMISSIONS } from '@lib/constants/permissions';

export function useBasePermissions({ base }) {
  const [basePermissions, setBasePermissions] = useState(CUSTOM_PERMISSIONS.Base.map((item) => ({
    ...item,
    enabled: item.defaultValue ?? false,
  })));

  useEffect(() => {
    setBasePermissions(CUSTOM_PERMISSIONS.Base.map((item) => ({
      ...item,
      enabled: item.defaultValue ?? false,
    })));
  }, [base]);

  const handleBasePermissionsToggle = (selectedItem) => {
    setBasePermissions(basePermissions.map((item) => ({
      ...item,
      enabled: item.name === selectedItem.name
        ? !item.enabled
        : item.enabled,
    })));
  };

  return {
    basePermissions,
    handleBasePermissionsToggle,
  };
}
