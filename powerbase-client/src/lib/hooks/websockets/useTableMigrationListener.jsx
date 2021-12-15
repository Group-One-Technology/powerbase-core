import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import { pusher } from '.';

const DEFAULT_VALUE = {
  logging: false,
};

export function useTableMigrationListener({ logging = false, tables, mutate } = DEFAULT_VALUE) {
  const [migratingTables, setMigratingTables] = useState(tables?.filter((item) => !item.isMigrated));

  const migrationListener = (tableId) => {
    if (mutate) {
      Pusher.logToConsole = logging;
      const channel = pusher.subscribe(`table.${tableId}`);

      channel.bind('table-migration-listener', async () => {
        await mutate();
      });
    }
  };

  const fieldMigrationListener = (tableId) => {
    if (mutate) {
      Pusher.logToConsole = logging;
      const channel = pusher.subscribe(`table.${tableId}`);

      channel.bind('field-migration-listener', async () => {
        await mutate();
      });
    }
  };

  const unsubscribe = (databaseId) => {
    pusher.unsubscribe(`database.${databaseId}`);
  };

  useEffect(() => {
    if (tables && mutate) {
      const updatedMigratingTables = tables?.filter((item) => !item.isMigrated);

      migratingTables?.forEach((table) => {
        const isMigrated = !updatedMigratingTables.some((item) => item.id === table.id);
        if (isMigrated) unsubscribe(table.id);
      });

      updatedMigratingTables?.map((table) => migrationListener(table.id));
      setMigratingTables(updatedMigratingTables);
    }
  }, [tables]);

  return {
    migrationListener,
    fieldMigrationListener,
  };
}
