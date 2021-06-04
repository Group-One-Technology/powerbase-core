import { securedApi } from './index';

export async function getTableFields({ tableId }) {
  const response = await securedApi.get(`/tables/${tableId}/fields`);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}
