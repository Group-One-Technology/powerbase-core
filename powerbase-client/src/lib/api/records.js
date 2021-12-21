import { securedApi } from './index';

export async function getTableRecords({ url, ...payload }) {
  const response = await securedApi.post(url, payload);

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

export async function initializeMagicValueForVirtualTable(payload) {
  const response = await securedApi.post(
    '/magic_values',
    payload,
  );

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function addMagicRecord(payload) {
  const response = await securedApi.post(
    '/magic_records',
    payload,
  );

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function addOrUpdateMagicValue({ tableId, ...payload }) {
  const response = await securedApi.post(
    `/tables/${tableId}/magic_value`,
    payload,
  );

  if (response.statusText === 'OK') {
    return response;
  }
  return undefined;
}

export async function updateRemoteValue({ tableId, ...payload }) {
  const response = await securedApi.post(`tables/${tableId}/remote_value`, payload);
  if (response.statusText === 'OK') {
    return response;
  }
  return undefined;
}
