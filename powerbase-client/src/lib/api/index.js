import axios from 'axios';

const BASE_URL = process.env.API;

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

export const securedApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

securedApi.interceptors.request.use((config) => {
  const method = config.method.toUpperCase();

  if (method !== 'OPTIONS' && method !== 'GET') {
    config.headers = {
      ...config.headers,
      'X-CSRF-TOKEN': localStorage.csrf,
    };
  }

  return config;
});

securedApi.interceptors.response.use(null, (error) => {
  if (error?.response?.status === 401) {
    return api.post('/refresh', {}, {
      headers: {
        'X-CSRF-TOKEN': localStorage.csrf,
      },
    })
      .then((response) => {
        localStorage.csrf = response.data.csrf;
        localStorage.signedIn = true;

        let retryConfig = error.response.config;
        retryConfig.headers['X-CSRF-TOKEN'] = localStorage.csrf;

        return api.request(retryConfig)
      })
      .catch((error) => {
        delete localStorage.csrf;
        delete localStorage.signedIn;

        location.replace('/');
        return Promise.reject(error);
      });
  } else {
    return Promise.reject(error);
  }
});
