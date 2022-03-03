import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { IS_PRODUCTION } from '@lib/constants';
import { App } from './App';

const { SENTRY_DSN, ENABLE_SENTRY } = process.env;

if (ENABLE_SENTRY === 'true' || IS_PRODUCTION) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [new BrowserTracing()],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
}

ReactDOM.render(<App />, document.getElementById('root'));
