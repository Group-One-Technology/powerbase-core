import { useEffect, useState } from 'react';
import { CUSTOM_PERMISSIONS } from '@lib/constants/permissions';

function initializeTablePermissions(tables, permissions) {
  const tablePermissions = {};
  tables?.forEach((table) => {
    tablePermissions[table.id] = CUSTOM_PERMISSIONS.Table
      .map((item) => ({
        ...item,
        value: permissions?.tables != null
          ? permissions.tables[table.id][item.key] ?? item.value
          : item.value ?? false,
      }))
      .map((item) => ({ [item.key]: item.value }))
      .reduce((acc, cur) => ({ ...acc, ...cur }), {});
  });

  return tablePermissions;
}

export function useTablePermissions({
  guest,
  tables,
  permissions,
  canToggleAccess,
}) {
  const [tablePermissions, setTablePermissions] = useState(initializeTablePermissions(tables, permissions));

  useEffect(() => {
    setTablePermissions(initializeTablePermissions(tables, permissions));
  }, [guest, tables]);

  const handleTablePermissionToggle = async (table, selectedItem) => {
    if (canToggleAccess) {
      const updatedTablePermission = {
        ...tablePermissions,
        [table.id]: {
          ...tablePermissions[table.id],
          [selectedItem.key]: !tablePermissions[table.id][selectedItem.key],
        },
      };

      setTablePermissions(updatedTablePermission);
    }
  };

  return {
    tablePermissions,
    handleTablePermissionToggle,
  };
}
