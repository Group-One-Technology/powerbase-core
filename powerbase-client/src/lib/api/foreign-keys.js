import { securedApi } from './index';

export async function getTableForeignKeys({ tableId }) {
  const response = await securedApi.get(`/tables/${tableId}/foreign_keys`);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}
