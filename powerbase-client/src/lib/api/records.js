import { securedApi } from './index';

export async function getTableRecords({ url, ...payload }) {
  const response = await securedApi.put(url, payload);

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
