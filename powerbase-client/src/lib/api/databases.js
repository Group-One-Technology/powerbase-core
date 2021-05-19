import { api } from './index';

export async function connectDatabase({
  host,
  port,
  username,
  password,
  database,
  color,
}) {
  const response = await api.post('/databases/connect', {
    host,
    port,
    username,
    password,
    database,
    color,
  });

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}
