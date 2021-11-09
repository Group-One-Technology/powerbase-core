import { useEffect, useState } from 'react';
import { useBaseUser } from '@models/BaseUser';
import { CUSTOM_PERMISSIONS } from '@lib/constants/permissions';

export function useTablePermissions({ tables, guest }) {
  const { access: { changeGuestAccess, inviteGuests } } = useBaseUser();
  const canToggleAccess = guest ? changeGuestAccess : inviteGuests;

  const [table, setTable] = useState();
  const [loading] = useState(false);
  const [tablePermissions, setTablePermissions] = useState(CUSTOM_PERMISSIONS.Table.map((item) => ({
    ...item,
    enabled: false,
  })));

  useEffect(() => {
    setTablePermissions(CUSTOM_PERMISSIONS.Table.map((item) => ({
      ...item,
      enabled: false,
    })));
  }, [table]);

  useEffect(() => {
    if (tables?.length) {
      setTable(tables[0]);
    }
  }, [tables]);

  const handlePermissionToggle = (selectedItem) => {
    setTablePermissions(tablePermissions.map((item) => ({
      ...item,
      enabled: item.name === selectedItem.name
        ? !item.enabled
        : item.enabled,
    })));
  };

  return {
    table,
    setTable,
    tablePermissions,
    handlePermissionToggle,
    canToggleAccess,
    loading,
  };
}
