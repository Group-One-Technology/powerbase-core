import { securedApi } from './index';

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

  if (response.statusText === 'OK') {
    return response.data;
  }

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

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function getBaseInvitations() {
  const response = await securedApi.get('/base_invitations');

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function getDatabase({ id }) {
  const response = await securedApi.get(`/databases/${id}`);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function updateDatabase({ id, ...payload }) {
  const response = await securedApi.put(`/databases/${id}`, payload);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}
