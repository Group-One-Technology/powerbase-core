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
import { BasePage } from '@pages/bases/[id]';
import { CreateBasePage } from '@pages/bases/create';
import { ConnectBasePage } from '@pages/bases/connect';
import { ConnectURLBasePage } from '@pages/bases/connect-url';
import { TablePage } from '@pages/tables/[id]';

import './index.css';

export function App() {
  return (
    <GlobalProviders>
      <Router>
        <Switch>
          <Route exact path="/" component={BasesPage} />
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/register" component={RegisterPage} />
          <Route path="/bases">
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
      <Route exact path={`${path}/`} component={BasesPage} />
      <Route exact path={`${path}/create`} component={CreateBasePage} />
      <Route exact path={`${path}/connect`} component={ConnectBasePage} />
      <Route exact path={`${path}/connect-url`} component={ConnectURLBasePage} />
      <Route exact path={`${path}/:id`} component={BasePage} />
      <Route path={`${path}/:databaseId/tables/:id`} component={TablePage} />
      <Route path="*" component={() => <h1>Not found!</h1>} />
    </Switch>
  );
}
