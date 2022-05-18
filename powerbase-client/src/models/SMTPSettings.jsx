import useSWR from 'swr';
import constate from 'constate';

import { getSMTPSettings } from '@lib/api/settings';

function useSMTPSettingsModel() {
  const response = useSWR('/settings/smtp', getSMTPSettings);

  return {
    ...response,
  };
}

export const [SMTPSettingsProvider, useSMTPSettings] = constate(useSMTPSettingsModel);
