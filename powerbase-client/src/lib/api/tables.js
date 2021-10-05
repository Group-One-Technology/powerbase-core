import { securedApi } from './index';

export async function getTable({ id }) {
  const response = await securedApi.get(`/tables/${id}`);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function getTables({ databaseId }) {
  const response = await securedApi.get(`/databases/${databaseId}/tables`);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function updateTables({ databaseId, ...payload }) {
  const response = await securedApi.put(`/databases/${databaseId}/tables/update`, payload);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function updateTableDefaultView({ tableId, viewId }) {
  const response = await securedApi.put(`tables/${tableId}/update_default_view`, { viewId });

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}
