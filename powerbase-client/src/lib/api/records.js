import { securedApi } from './index';

export async function getTableRecords({ tableId, ...payload }) {
  const response = await securedApi.put(`/tables/${tableId}/records`, payload);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}
