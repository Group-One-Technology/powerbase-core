import { securedApi } from './index';

export async function getTableRecords({ tableId, ...payload }) {
  const response = await securedApi.put(`/tables/${tableId}/records`, payload);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function getTableRecordsCount({ tableId }) {
  const response = await securedApi.get(`/tables/${tableId}/records_count`);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}
