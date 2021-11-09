import { useEffect, useState } from 'react';
import { useBaseUser } from '@models/BaseUser';
import { CUSTOM_PERMISSIONS } from '@lib/constants/permissions';
import { useFieldPermissions } from './useFieldPermissions';

export function useTablePermissions({ tables, guest }) {
  const { access: { changeGuestAccess, inviteGuests } } = useBaseUser();
  const canToggleAccess = guest ? changeGuestAccess : inviteGuests;

  const [table, setTable] = useState();
  const [loading] = useState(false);
  const [tablePermissions, setTablePermissions] = useState(CUSTOM_PERMISSIONS.Table.map((item) => ({
    ...item,
    enabled: false,
  })));

  const fieldState = useFieldPermissions({ table });

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

  const handleTablePermissionToggle = (selectedItem) => {
    setTablePermissions(tablePermissions.map((item) => ({
      ...item,
      enabled: item.name === selectedItem.name
        ? !item.enabled
        : item.enabled,
    })));
  };

  return {
    canToggleAccess,
    tableState: {
      table,
      setTable,
      tablePermissions,
      handleTablePermissionToggle,
      loading,
    },
    fieldState,
  };
}
