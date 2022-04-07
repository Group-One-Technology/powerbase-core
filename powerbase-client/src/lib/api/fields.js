import queryString from 'query-string';
import { isResponseSuccess, securedApi } from './index';

export async function getTableFields({ tableId }) {
  const response = await securedApi.get(`/tables/${tableId}/fields`);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function updateFieldAlias({ id, ...payload }) {
  const response = await securedApi.put(`/fields/${id}/alias`, payload);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function updateFieldType({ id, ...payload }) {
  const response = await securedApi.put(`/fields/${id}/field_type`, payload);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function updateFieldOptions({ id, ...payload }) {
  const response = await securedApi.put(`/fields/${id}/options`, payload);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function setFieldAsPII({ id }) {
  const response = await securedApi.put(`/fields/${id}/set_as_pii`);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function unsetFieldAsPII({ id }) {
  const response = await securedApi.put(`/fields/${id}/unset_as_pii`);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function enableFieldValidation({ id }) {
  const response = await securedApi.put(`/fields/${id}/enable_validation`);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function disableFieldValidation({ id }) {
  const response = await securedApi.put(`/fields/${id}/disable_validation`);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function setFieldAsNullable({ id }) {
  const response = await securedApi.put(`/fields/${id}/set_as_nullable`);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function unsetFieldAsNullable({ id }) {
  const response = await securedApi.put(`/fields/${id}/unset_as_nullable`);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function updateFieldPermission({ id, ...payload }) {
  const response = await securedApi.put(`/fields/${id}/update_field_permission`, payload);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function updateFieldPermissionAllowedRoles({ id, ...payload }) {
  const response = await securedApi.put(`/fields/${id}/allowed_roles`, payload);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function getFieldByName({ tableId, alias, name }) {
  const params = queryString.stringify({ alias, name });
  const response = await securedApi.get(`tables/${tableId}/fields?${params}`);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function addField({
  tableId,
  name,
  alias,
  isNullable,
  isPii,
  hasValidation,
  fieldTypeId,
  isVirtual,
  dbType,
  selectOptions,
  options,
}) {
  const response = await securedApi.post(`/tables/${tableId}/fields`, {
    name,
    alias,
    isNullable,
    isPii,
    hasValidation,
    fieldTypeId,
    isVirtual,
    dbType,
    selectOptions,
    options,
  });
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function dropField({ fieldId }) {
  const response = await securedApi.delete(`/fields/${fieldId}`);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}
