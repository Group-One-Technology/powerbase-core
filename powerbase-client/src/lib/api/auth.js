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

export async function logout() {
  const response = await securedApi.post('/logout');

  if (response.statusText === 'OK') {
    return true;
  }

  return undefined;
}

export async function auth() {
  if (!localStorage.signedIn) {
    return null;
  }

  const response = await securedApi.get('/auth');

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}
