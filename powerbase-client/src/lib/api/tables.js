import { securedApi, isResponseSuccess } from './index';

export async function getTable({ id }) {
  const response = await securedApi.get(`/tables/${id}`);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function getTableLogs({ id }) {
  const response = await securedApi.get(`/tables/${id}/logs`);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function updateTableAlias({ tableId, alias }) {
  const response = await securedApi.put(`/tables/${tableId}/alias`, {
    alias,
  });
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function hideTable({ tableId }) {
  const response = await securedApi.put(`/tables/${tableId}/hide`);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function dropTable({ tableId }) {
  const response = await securedApi.delete(`/tables/${tableId}/drop`);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function getTables({ databaseId }) {
  const response = await securedApi.get(`/databases/${databaseId}/tables`);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function updateTables({ databaseId, ...payload }) {
  const response = await securedApi.put(
    `/databases/${databaseId}/tables/update`,
    payload,
  );

  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function updateTableDefaultView({ tableId, viewId }) {
  const response = await securedApi.put(
    `tables/${tableId}/update_default_view`,
    { viewId },
  );

  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function updateTablePrimaryKeys({ tableId, primaryKeys }) {
  const response = await securedApi.put(
    `tables/${tableId}/update_primary_keys`,
    { primaryKeys },
  );

  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function updateTablePermission({ id, ...payload }) {
  const response = await securedApi.put(`/tables/${id}/update_table_permission`, payload);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function updateTablePermissionAllowedRoles({ id, ...payload }) {
  const response = await securedApi.put(`/tables/${id}/allowed_roles`, payload);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function addVirtualTable({ payload }) {
  const response = await securedApi.post('/tables/virtual_tables', payload);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function reindexTable({ tableId }) {
  const response = await securedApi.post(`/tables/${tableId}/reindex_records`);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}
