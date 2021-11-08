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
    delete localStorage.csrf;
    delete localStorage.signedIn;

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

export async function register({
  firstName,
  lastName,
  email,
  password,
  passwordConfirmation,
}) {
  const response = await securedApi.post('/register', {
    firstName,
    lastName,
    email,
    password,
    passwordConfirmation,
  });

  if (response.statusText === 'OK') {
    localStorage.csrf = response.data.csrf;
    localStorage.signedIn = true;

    return response.data;
  }

  return undefined;
}

export async function getAuthGuestByDatabase({ databaseId }) {
  const response = await securedApi.get(`/auth/databases/${databaseId}/guest`);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}
