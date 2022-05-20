import useSWR from 'swr';
import constate from 'constate';

import { getGeneralSettings } from '@lib/api/settings';

function useGeneralSettingsModel() {
  const response = useSWR('/settings/general', getGeneralSettings);

  return {
    ...response,
  };
}

export const [GeneralSettingsProvider, useGeneralSettings] = constate(useGeneralSettingsModel);
