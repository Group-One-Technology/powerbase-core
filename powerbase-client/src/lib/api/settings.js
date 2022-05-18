import { securedApi, isResponseSuccess } from './index';

export async function getSMTPSettings() {
  const response = await securedApi.get('/settings/smtp');
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function setupSettings({
  address,
  port,
  domain,
  email,
  password,
  username,
  useTLS,
}) {
  const response = await securedApi.post('/settings/smtp', {
    address,
    port,
    domain,
    email,
    password,
    username,
    useTLS,
  });
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}
