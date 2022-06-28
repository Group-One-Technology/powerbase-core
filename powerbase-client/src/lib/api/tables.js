import queryString from 'query-string';
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

export async function clearTableErrorLogs({ tableId }) {
  const response = await securedApi.put(`/tables/${tableId}/clear_error_logs`);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function createTable({
  databaseId,
  name,
  alias,
  isVirtual,
  fields,
}) {
  const response = await securedApi.post(`/databases/${databaseId}/tables`, {
    databaseId,
    name,
    alias,
    isVirtual,
    fields: fields.map((item) => ({
      name: item.name,
      alias: item.alias,
      isNullable: item.isNullable,
      isPii: item.isPii,
      hasValidation: item.hasValidation,
      fieldTypeId: item.fieldTypeId,
      isVirtual: item.isVirtual,
      isPrimaryKey: item.isPrimaryKey,
      dbType: item.dbType,
      selectOptions: item.selectOptions,
      options: item.options,
    })),
  });
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

export async function unhideTable({ tableId }) {
  const response = await securedApi.put(`/tables/${tableId}/unhide`);
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

export async function getTableByName({ databaseId, alias, name }) {
  const params = queryString.stringify({ alias, name });
  const response = await securedApi.get(`databases/${databaseId}/tables?${params}`);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function reorderTables({ databaseId, tables }) {
  const response = await securedApi.put(
    `/databases/${databaseId}/tables/reorder`,
    { tables },
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
