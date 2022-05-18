import { api, isResponseSuccess } from './index';

export async function getHasAdmin() {
  const response = await api.get('/users/has_admin');
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}
