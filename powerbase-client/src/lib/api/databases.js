import { api } from './index';

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
  const response = await api.post('/databases/connect', {
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
