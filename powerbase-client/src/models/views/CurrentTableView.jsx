import useSWR from 'swr';
import { useState } from 'react';
import constate from 'constate';

import { useAuthUser } from '@models/AuthUser';
import { getTables, updateTableDefaultView } from '@lib/api/tables';
import { getTableViews } from '@lib/api/views';

function useCurrentViewModel({ baseId, initialTableId, initialViewId }) {
  const { authUser } = useAuthUser();
  const [tableId, setTableId] = useState(initialTableId);
  const [viewId, setViewId] = useState(initialViewId);

  const tablesResponse = useSWR(
    (baseId && authUser) ? `/databases/${baseId}/tables` : null,
    () => getTables({ databaseId: baseId }),
    { revalidateOnFocus: true },
  );

  const viewsResponse = useSWR(
    (tableId && authUser) ? `/tables/${tableId}/views` : null,
    () => getTableViews({ tableId }),
    { revalidateOnFocus: true },
  );

  const currentTable = tablesResponse.data?.tables.find((table) => table.id.toString() === tableId.toString());
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
      currentTable.defaultViewId === view.id ? currentTable.name : `${currentTable.name} - ${view.name}`,
      `/base/${baseId}/table/${view.tableId}?view=${view.id}`,
    );

    setViewId(view.id);

    try {
      await updateTableDefaultView({ tableId: view.tableId, viewId: view.id });
      await tablesResponse.mutate();
    } catch (err) {
      console.log(err);
    }
  };

  return {
    table: currentTable,
    tables: tablesResponse.data?.tables,
    tablesResponse,
    view: currentView,
    views: viewsResponse.data,
    viewsResponse,
    setViewId,
    setTableId,
    handleTableChange,
    handleViewChange,
  };
}

export const [CurrentViewProvider, useCurrentView] = constate(useCurrentViewModel);
