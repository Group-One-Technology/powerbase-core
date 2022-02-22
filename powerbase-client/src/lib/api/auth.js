import { isResponseSuccess, securedApi } from './index';

export async function login({ email, password }) {
  const response = await securedApi.post('/login', {
    email,
    password,
  });
  if (isResponseSuccess(response)) {
    localStorage.csrf = response.data.csrf;
    localStorage.signedIn = true;

    return response.data;
  }

  return undefined;
}

export async function logout() {
  const response = await securedApi.post('/logout');

  if (isResponseSuccess(response)) {
    delete localStorage.csrf;
    delete localStorage.signedIn;
    return true;
  }

  return undefined;
}

export async function auth() {
  if (!localStorage.signedIn) return null;
  const response = await securedApi.get('/auth');
  if (isResponseSuccess(response)) return response.data;
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
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function confirmEmail({ token }) {
  const response = await securedApi.put('/confirm_email', { token });
  if (isResponseSuccess(response)) {
    localStorage.csrf = response.data.csrf;
    localStorage.signedIn = true;
    return response.data;
  }

  return undefined;
}

export async function resendConfirmEmail({ email, password }) {
  const response = await securedApi.put('/reconfirm_email', {
    email,
    password,
  });
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function forgotPassword({ email }) {
  const response = await securedApi.put('/forgot_password', { email });
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function resetPassword({
  token,
  password,
  passwordConfirmation,
}) {
  const response = await securedApi.put('/reset_password', {
    token,
    password,
    passwordConfirmation,
  });
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function getAuthGuestByDatabase({ databaseId }) {
  const response = await securedApi.get(`/auth/databases/${databaseId}/guest`);
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}

export async function setAuthUserAsOnboarded() {
  const response = await securedApi.put('/auth/onboarded');
  if (isResponseSuccess(response)) return response.data;
  return undefined;
}
