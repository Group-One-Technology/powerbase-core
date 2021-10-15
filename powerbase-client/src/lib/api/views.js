import { securedApi } from './index';

export async function getTableView({ id }) {
  const response = await securedApi.get(`/views/${id}`);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function getTableViews({ tableId }) {
  const response = await securedApi.get(`/tables/${tableId}/views`);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function createTableView({ tableId, ...payload }) {
  const response = await securedApi.post(`/tables/${tableId}/views`, payload);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function updateTableView({ id, ...payload }) {
  const response = await securedApi.put(`/views/${id}`, payload);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function deleteTableView({ id, ...payload }) {
  const response = await securedApi.delete(`/views/${id}`, payload);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function updateViewsOrder({ tableId, ...payload }) {
  const response = await securedApi.put(`/tables/${tableId}/views/order`, payload);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}
