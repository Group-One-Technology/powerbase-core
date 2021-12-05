import { securedApi } from './index';

export async function getTableRecords({ url, ...payload }) {
  const response = await securedApi.post(url, payload);
  console.log(url);
  console.log(payload);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function getMagicValues(url) {
  const response = await securedApi.get(url);
  if (response.statusText === 'OK') {
    return response.data;
  }
  return undefined;
}

export async function getTableRecord({ tableId, recordId, ...payload }) {
  const response = await securedApi.post(
    `/tables/${tableId}/records/${recordId}`,
    payload,
  );

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function getTableRecordsCount({ tableId, ...payload }) {
  const response = await securedApi.post(
    `/tables/${tableId}/records_count`,
    payload,
  );

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}
