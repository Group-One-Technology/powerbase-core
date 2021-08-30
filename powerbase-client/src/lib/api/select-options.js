import { securedApi } from './index';

export async function getSelectOptions({ fieldId }) {
  const response = await securedApi.get(`/fields/${fieldId}/select_options`);

  if (response.statusText === 'OK') {
    return response.data;
  }

  return undefined;
}
