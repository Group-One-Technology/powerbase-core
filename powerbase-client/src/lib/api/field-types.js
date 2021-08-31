import { securedApi } from './index';

export async function getFieldTypes() {
  const response = await securedApi.get('/field_types');

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}
