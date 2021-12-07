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

export async function updateFieldType({ id, ...payload }) {
  const response = await securedApi.put(`/fields/${id}/field_type`, payload);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function updateFieldOptions({ id, ...payload }) {
  const response = await securedApi.put(`/fields/${id}/options`, payload);

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

export async function updateFieldPermission({ id, ...payload }) {
  const response = await securedApi.put(`/fields/${id}/update_field_permission`, payload);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function updateFieldPermissionAllowedRoles({ id, ...payload }) {
  const response = await securedApi.put(`/fields/${id}/allowed_roles`, payload);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function searchFieldByName({ id, name }) {
  const response = await securedApi.get(`tables/${id}/fields/${name}`);
  return response;
}

export async function addVirtualField({ tableId, payload }) {
  const response = await securedApi.post(`/tables/${tableId}/field`, payload);
  return response;
}
