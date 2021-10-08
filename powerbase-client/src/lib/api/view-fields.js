import { securedApi } from './index';

export async function getViewFields({ viewId }) {
  const response = await securedApi.get(`/views/${viewId}/view_fields`);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function reorderViewFields({ viewId, ...payload }) {
  const response = await securedApi.put(`/views/${viewId}/view_fields/order`, payload);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function resizeViewFields({ viewFieldId, ...payload }) {
  const response = await securedApi.put(`/view_fields/${viewFieldId}/resize`, payload);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}
