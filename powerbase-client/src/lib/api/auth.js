import { api } from './index';

export async function login({ email, password }) {
  const response = await api.post('/login', {
    email,
    password,
  });

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}
