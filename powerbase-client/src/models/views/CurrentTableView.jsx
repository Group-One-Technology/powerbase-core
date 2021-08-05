import useSWR from 'swr';
import { useState } from 'react';
import constate from 'constate';
import { useAuthUser } from '@models/AuthUser';
import { getTables } from '@lib/api/tables';
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

  return {
    table: tablesResponse.data?.tables.find((table) => table.id.toString() === tableId.toString()),
    tables: tablesResponse.data?.tables,
    view: viewsResponse.data?.find((view) => view.id.toString() === viewId.toString()),
    views: viewsResponse.data,
    setViewId,
    setTableId,
    handleTableChange,
  };
}

export const [CurrentViewProvider, useCurrentView] = constate(useCurrentViewModel);
