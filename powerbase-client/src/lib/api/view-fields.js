import { securedApi } from './index';

export async function getViewFields({ viewId }) {
  const response = await securedApi.get(`/views/${viewId}/fields`);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}
