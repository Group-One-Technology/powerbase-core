import { securedApi } from './index';

export async function getGuests({ databaseId }) {
  const response = await securedApi.get(`/databases/${databaseId}/guests`);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function inviteGuestToSampleDatabase() {
  const response = await securedApi.post('/guests/invite_sample_database');

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

export async function leaveBase({ guestId }) {
  const response = await securedApi.delete(`/guests/${guestId}/leave_base`);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function acceptGuestInvitation({ id, ...payload }) {
  const response = await securedApi.put(`/guests/${id}/accept_invite`, payload);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function rejectGuestInvitation({ id, ...payload }) {
  const response = await securedApi.put(`/guests/${id}/reject_invite`, payload);

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

export async function updateGuestPermissions({ id, ...payload }) {
  const response = await securedApi.put(`/guests/${id}/update_permissions`, payload);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function updateGuestFieldPermissions({ id, ...payload }) {
  const response = await securedApi.put(`/guests/${id}/update_field_permissions`, payload);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function updateGuestTablePermissions({ id, ...payload }) {
  const response = await securedApi.put(`/guests/${id}/update_table_permissions`, payload);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function updateGuestDatabasePermissions({ id, ...payload }) {
  const response = await securedApi.put(`/guests/${id}/update_database_permissions`, payload);

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
