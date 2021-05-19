import { securedApi } from './index';

export async function login({ email, password }) {
  const response = await securedApi.post('/login', {
    email,
    password,
  });

  if (response.statusText === 'OK') {
    localStorage.csrf = response.data.csrf;
    localStorage.signedIn = true;

    return response.data;
  }

  return undefined;
}
