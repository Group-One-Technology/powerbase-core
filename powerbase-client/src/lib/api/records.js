import { securedApi } from './index';

export async function getTableRecords({ tableId }) {
  const response = await securedApi.get(`/tables/${tableId}/records`);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}
