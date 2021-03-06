import React from 'react';
import {
  Switch,
  Route,
  Redirect,
  useRouteMatch,
  BrowserRouter as Router,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { GlobalProviders } from '@components/GlobalProviders';
import { SetupPage } from '@pages/setup';
import { OnboardingPage } from '@pages/onboarding';
import { LoginPage } from '@pages/login';
import { RegisterPage } from '@pages/register';
import { ConfirmEmailNoticePage } from '@pages/confirm-email';
import { ReconfirmEmailPage } from '@pages/reconfirm-email';
import { ForgotPasswordPage } from '@pages/forgot-password';
import { BasesPage } from '@pages/bases';
import { SettingsPage } from '@pages/settings';
import { Error404Page } from '@pages/404';

import { ConfirmEmailPage } from '@pages/user/confirm-email';
import { ResetPasswordPage } from '@pages/user/reset-password';

import { BasePage } from '@pages/base/[id]';
import { AddBasePage } from '@pages/base/add-base';
import { ConnectBasePage } from '@pages/base/connect';
import { ConnectIntegrationBasePage } from '@pages/base/connect-integration';
import { BaseSettingsPage } from '@pages/base/[id]/settings';
import { BaseProgressPage } from '@pages/base/[id]/progress';
import { TablePage } from '@pages/base/[id]/table/[id]';

import './index.css';
import { AdminSettingsPage } from '@pages/admin-settings';

export function App() {
  return (
    <Router>
      <GlobalProviders>
        <Switch>
          <Route exact path="/" component={BasesPage} />
          <Route exact path="/setup" component={SetupPage} />
          <Route exact path="/onboarding" component={OnboardingPage} />
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/register" component={RegisterPage} />
          <Route exact path="/confirm-email" component={ConfirmEmailNoticePage} />
          <Route exact path="/reconfirm-email" component={ReconfirmEmailPage} />
          <Route exact path="/forgot-password" component={ForgotPasswordPage} />
          <Route exact path="/bases" component={BasesPage} />
          <Route exact path="/admin_settings" component={AdminSettingsPage} />
          <Route path="/base">
            <BasesRoute />
          </Route>
          <Route path="/user">
            <UserRoute />
          </Route>
          <Route path="/404" component={Error404Page} />
          <Redirect from="*" to="/404" />
        </Switch>
        <Toaster position="bottom-right" />
      </GlobalProviders>
    </Router>
  );
}

function BasesRoute() {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${path}/add`} component={AddBasePage} />
      <Route exact path={`${path}/connect`} component={ConnectBasePage} />
      <Route
        exact
        path={`${path}/integration/connect`}
        component={ConnectIntegrationBasePage}
      />
      <Route exact path={`${path}/:id`} component={BasePage} />
      <Route exact path={`${path}/:id/settings`} component={BaseSettingsPage} />
      <Route exact path={`${path}/:id/progress`} component={BaseProgressPage} />
      <Route path={`${path}/:baseId/table/:id`} component={TablePage} />
      <Redirect from="*" to="/404" />
    </Switch>
  );
}

function UserRoute() {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${path}/confirm-email`} component={ConfirmEmailPage} />
      <Route exact path={`${path}/reset-password`} component={ResetPasswordPage} />
      <Route exact path={`${path}/settings`} component={SettingsPage} />
      <Redirect from="*" to="/404" />
    </Switch>
  );
}
