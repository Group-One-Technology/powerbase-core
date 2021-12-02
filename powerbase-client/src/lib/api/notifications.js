import { securedApi } from '.';

export async function getBaseInvitations() {
  const response = await securedApi.get('/base_invitations');

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}

export async function getNotifications() {
  const response = await securedApi.get('/notifications');

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}
