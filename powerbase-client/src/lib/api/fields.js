import { securedApi } from './index';

export async function getTableFields({ tableId }) {
  const response = await securedApi.get(`/tables/${tableId}/fields`);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function updateFieldAlias({ id, ...payload }) {
  const response = await securedApi.put(`/fields/${id}/alias`, payload);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function setFieldAsPII({ id }) {
  const response = await securedApi.put(`/fields/${id}/set_as_pii`);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function unsetFieldAsPII({ id }) {
  const response = await securedApi.put(`/fields/${id}/unset_as_pii`);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}
