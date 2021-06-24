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
