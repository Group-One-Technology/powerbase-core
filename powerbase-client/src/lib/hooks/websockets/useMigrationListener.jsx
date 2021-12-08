import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import { pusher } from '.';

const DEFAULT_VALUE = {
  logging: false,
};

export function useMigrationListener({ logging = false, databases, mutate } = DEFAULT_VALUE) {
  const [migratingBases, setMigratingBases] = useState(databases
    ?.filter((item) => !item.isMigrated)
    .map((item) => ({ ...item, subscribed: false })));

  const migrationListener = (databaseId) => {
    if (mutate) {
      Pusher.logToConsole = logging;
      const channel = pusher.subscribe(`database.${databaseId}`);

      channel.bind('migration-listener', async () => {
        await mutate();
      });
    }
  };

  const unsubscribe = (databaseId) => {
    pusher.unsubscribe(`database.${databaseId}`);
  };

  useEffect(() => {
    if (databases && mutate) {
      const updatedMigratingBases = databases?.filter((item) => !item.isMigrated);

      migratingBases?.forEach((base) => {
        const isMigrated = !updatedMigratingBases.some((item) => item.id === base.id);
        if (isMigrated) unsubscribe(base.id);
      });

      updatedMigratingBases?.map((base) => migrationListener(base.id));
      setMigratingBases(updatedMigratingBases);
    }
  }, [databases]);

  return {
    migrationListener,
  };
}
