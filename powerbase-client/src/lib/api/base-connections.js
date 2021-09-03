import { securedApi } from './index';

export async function getBaseConnections({ baseId }) {
  const response = await securedApi.get(`/databases/${baseId}/connections`);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function getTableConnections({ tableId }) {
  const response = await securedApi.get(`/tables/${tableId}/connections`);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function addBaseConnection({ baseId, ...payload }) {
  const response = await securedApi.post(`/databases/${baseId}/connections`, payload);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function updateBaseConnection({ id, ...payload }) {
  const response = await securedApi.put(`/connections/${id}`, payload);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}
