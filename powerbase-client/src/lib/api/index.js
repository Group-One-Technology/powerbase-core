import axios from 'axios';

const BASE_URL = process.env.API;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});
