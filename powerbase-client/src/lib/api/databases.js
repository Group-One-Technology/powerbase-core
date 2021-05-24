import { securedApi } from './index';

export async function connectDatabase({
  adapter,
  host,
  port,
  username,
  password,
  database,
  connectionString,
  color,
}) {
  const response = await securedApi.post('/databases/connect', {
    adapter,
    host,
    port,
    username,
    password,
    database,
    connectionString,
    color,
  });

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function getDatabases({ userId }) {
  const response = await securedApi.get('/databases');

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