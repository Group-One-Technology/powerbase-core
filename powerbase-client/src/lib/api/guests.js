import { securedApi } from './index';

export async function getGuests({ databaseId }) {
  const response = await securedApi.get(`/databases/${databaseId}/guests`);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function inviteGuest({ databaseId, ...payload }) {
  const response = await securedApi.post(`/databases/${databaseId}/guests`, payload);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function changeGuestAccess({ id, ...payload }) {
  const response = await securedApi.put(`/guests/${id}/change_access`, payload);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function removeGuest({ id }) {
  const response = await securedApi.delete(`/guests/${id}`);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}
