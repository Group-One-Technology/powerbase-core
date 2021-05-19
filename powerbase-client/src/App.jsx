import React from 'react';
import {
  Switch,
  Route,
  useRouteMatch,
  BrowserRouter as Router,
} from 'react-router-dom';

import { LoginPage } from '@pages/login';
import { HomePage } from '@pages/home';
import { BasePage } from '@pages/bases/[id]';
import { CreateBasePage } from '@pages/bases/create';
import { ConnectBasePage } from '@pages/bases/connect';
import { ConnectURLBasePage } from '@pages/bases/connect-url';
import { GlobalProviders } from '@components/GlobalProviders';

import './index.css';

export function App() {
  return (
    <GlobalProviders>
      <Router>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/login" component={LoginPage} />
          <Route path="/bases">
            <BasesRoute />
          </Route>
          <Route path="*" component={() => <h1>Not found!</h1>} />
        </Switch>
      </Router>
    </GlobalProviders>
  );
};

function BasesRoute() {
  const { path, url } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${path}/create`} component={CreateBasePage} />
      <Route exact path={`${path}/connect`} component={ConnectBasePage} />
      <Route exact path={`${path}/connect-url`} component={ConnectURLBasePage} />
      <Route path={`${path}/:id`} component={BasePage} />
      <Route path="*" component={() => <h1>Not found!</h1>} />
    </Switch>
  );
}