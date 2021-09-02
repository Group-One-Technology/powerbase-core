import { securedApi } from './index';

export async function getBaseConnections({ tableId }) {
  const response = await securedApi.get(`/tables/${tableId}/connections`);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}
