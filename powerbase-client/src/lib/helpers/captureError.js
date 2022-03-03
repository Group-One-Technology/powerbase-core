import * as Sentry from '@sentry/react';

export const captureError = (error) => {
  Sentry.setContext('response', error.response?.data || error);
  Sentry.captureException(error);
};
