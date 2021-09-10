import { securedApi } from './index';

export async function clearBaseLogs({ databaseId }) {
  const response = await securedApi.put(`/databases/${databaseId}/clear_logs`);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}
