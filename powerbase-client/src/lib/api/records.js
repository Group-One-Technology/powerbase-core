import { securedApi, isResponseSuccess } from './index';

export async function getTableRecords({ url, ...payload }) {
  const response = await securedApi.post(url, payload);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function getTableRecord({ tableId, recordId, ...payload }) {
  const response = await securedApi.post(
    `/tables/${tableId}/records/${recordId}`,
    payload,
  );

  if (isResponseSuccess(response)) return response.data;
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

export async function addRecord({ tableId, primaryKeys, data }) {
  const response = await securedApi.post(`tables/${tableId}/add_record`, {
    primary_keys: primaryKeys,
    data,
  });
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function updateRecord({ tableId, primaryKeys, data }) {
  const response = await securedApi.put(`tables/${tableId}/update_record`, {
    primary_keys: primaryKeys,
    data,
  });
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function updateFieldData({
  tableId,
  primaryKeys,
  fieldId,
  data,
}) {
  const response = await securedApi.put(`tables/${tableId}/update_field_data`, {
    primary_keys: primaryKeys,
    field_id: fieldId,
    data,
  });
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function deleteRecord({ tableId, primaryKeys }) {
  const response = await securedApi.delete(`tables/${tableId}/delete_record`, {
    data: {
      primary_keys: primaryKeys,
    },
  });
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}
