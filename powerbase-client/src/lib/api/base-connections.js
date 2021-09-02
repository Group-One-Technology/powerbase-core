import { securedApi } from './index';

export async function getBaseConnections({ baseId }) {
  const response = await securedApi.get(`/databases/${baseId}/connections`);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function getTableConnections({ tableId }) {
  const response = await securedApi.get(`/tables/${tableId}/connections`);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}
