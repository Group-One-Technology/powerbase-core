import useSWR from 'swr';
import { useEffect, useState } from 'react';
import constate from 'constate';

import { useAuthUser } from '@models/AuthUser';
import { getTables, updateTableDefaultView } from '@lib/api/tables';
import { getTableViews } from '@lib/api/views';
import { useTableMigrationListener } from '@lib/hooks/websockets/useTableMigrationListener';
import { useMigrationListener } from '@lib/hooks/websockets/useMigrationListener';

function useCurrentViewModel({ baseId, initialTableId, initialViewId }) {
  const { authUser } = useAuthUser();
  const [tableId, setTableId] = useState(initialTableId);
  const [viewId, setViewId] = useState(initialViewId);
  const [tables, setTables] = useState();

  const tablesResponse = useSWR(
    (baseId && authUser) ? `${authUser.id}/databases/${baseId}/tables` : null,
    () => (baseId ? getTables({ databaseId: baseId }) : undefined),
    { revalidateOnFocus: true },
  );

  const viewsResponse = useSWR(
    (tableId && authUser) ? `${authUser.id}/tables/${tableId}/views` : null,
    () => (tableId ? getTableViews({ tableId }) : undefined),
    { revalidateOnFocus: true },
  );

  useTableMigrationListener({ tables: tablesResponse?.data, mutate: tablesResponse?.mutate });
  const { migrationListener } = useMigrationListener({ mutate: tablesResponse?.mutate });

  const currentTable = tableId
    ? tablesResponse?.data?.find((table) => table.id.toString() === tableId.toString())
    : undefined;
  const currentView = viewsResponse.data?.find((view) => view.id.toString() === viewId?.toString());

  const handleTableChange = ({ table }) => {
    window.history.replaceState(
      null,
      table.name,
      `/base/${baseId}/table/${table.id}?${table.defaultViewId ? `view=${table.defaultViewId}` : ''}`,
    );

    setTableId(table.id);
    setViewId(table.defaultViewId);
    viewsResponse.mutate();
  };

  const handleViewChange = async (view) => {
    window.history.replaceState(
      null,
      currentTable.defaultViewId === view.id
        ? currentTable.name
        : `${currentTable.name} - ${view.name}`,
      `/base/${baseId}/table/${view.tableId}?view=${view.id}`,
    );

    setViewId(view.id);

    try {
      await updateTableDefaultView({ tableId: view.tableId, viewId: view.id });
      await tablesResponse?.mutate();
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    migrationListener(baseId);
  }, [baseId]);

  useEffect(() => {
    setTables(tablesResponse?.data?.filter((item) => !item.isHidden));
    if (tablesResponse?.data?.length && currentTable == null) {
      const firstTable = tablesResponse?.data[0];
      handleTableChange({ table: firstTable });
    }
  }, [tablesResponse?.data]);

  return {
    table: currentTable,
    tables,
    setTables,
    tablesResponse,
    view: currentView,
    views: viewsResponse.data,
    viewsResponse,
    setViewId,
    setTableId,
    handleTableChange,
    handleViewChange,
    mutateTables: tablesResponse?.mutate,
  };
}

export const [CurrentViewProvider, useCurrentView] = constate(useCurrentViewModel);
