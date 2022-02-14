import { isResponseSuccess, securedApi } from './index';

export async function connectDatabase({
  name,
  adapter,
  host,
  port,
  username,
  password,
  database,
  connectionString,
  isTurbo,
  color,
}) {
  const response = await securedApi.post('/databases/connect', {
    name,
    adapter,
    host,
    port,
    username,
    password,
    database,
    connectionString,
    isTurbo,
    color,
  });
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function getDatabases() {
  const response = await securedApi.get('/databases');

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function getSharedDatabases() {
  const response = await securedApi.get('/shared_databases');
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function getDatabase({ id }) {
  const response = await securedApi.get(`/databases/${id}`);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function getDatabaseActiveConnections({ id }) {
  const response = await securedApi.get(`/databases/${id}/active_connections`);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function updateDatabase({ id, ...payload }) {
  const response = await securedApi.put(`/databases/${id}`, payload);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function disconnectDatabase({ id }) {
  const response = await securedApi.delete(`/databases/${id}`);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function updateDatabasePermission({ id, ...payload }) {
  const response = await securedApi.put(`/databases/${id}/update_database_permission`, payload);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function updateDatabasePermissionAllowedRoles({ id, ...payload }) {
  const response = await securedApi.put(`/databases/${id}/allowed_roles`, payload);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}
