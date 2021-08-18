import React from 'react';
import {
  Switch,
  Route,
  useRouteMatch,
  BrowserRouter as Router,
} from 'react-router-dom';

import { GlobalProviders } from '@components/GlobalProviders';
import { LoginPage } from '@pages/login';
import { RegisterPage } from '@pages/register';
import { BasesPage } from '@pages/bases';
import { BasePage } from '@pages/base/[id]';
import { AddBasePage } from '@pages/base/add-base';
import { CreateBasePage } from '@pages/base/create';
import { ConnectBasePage } from '@pages/base/connect';
import { ConnectURLBasePage } from '@pages/base/connect-url';
import { ConnectIntegrationBasePage } from '@pages/base/connect-integration';
import { BaseSettingsPage } from '@pages/base/[id]/settings';
import { TablePage } from '@pages/base/table/[id]';

import './index.css';

export function App() {
  return (
    <GlobalProviders>
      <Router>
        <Switch>
          <Route exact path="/" component={BasesPage} />
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/register" component={RegisterPage} />
          <Route exact path="/bases" component={BasesPage} />
          <Route path="/base">
            <BasesRoute />
          </Route>
          <Route path="*" component={() => <h1>Not found!</h1>} />
        </Switch>
      </Router>
    </GlobalProviders>
  );
}

function BasesRoute() {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${path}/add`} component={AddBasePage} />
      <Route exact path={`${path}/create`} component={CreateBasePage} />
      <Route exact path={`${path}/connect`} component={ConnectBasePage} />
      <Route exact path={`${path}/connect-url`} component={ConnectURLBasePage} />
      <Route exact path={`${path}/integration/connect`} component={ConnectIntegrationBasePage} />
      <Route exact path={`${path}/:id`} component={BasePage} />
      <Route exact path={`${path}/:id/settings`} component={BaseSettingsPage} />
      <Route path={`${path}/:baseId/table/:id`} component={TablePage} />
      <Route path="*" component={() => <h1>Not found!</h1>} />
    </Switch>
  );
}
