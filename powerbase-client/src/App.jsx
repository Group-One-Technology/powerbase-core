import React from 'react';
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom';
import { LoginPage } from '@pages/LoginPage';
import { HomePage } from '@pages/HomePage';

import './index.css';

export function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <HomePage />
        </Route>
        <Route exact path="/login">
          <LoginPage />
        </Route>
      </Switch>
    </Router>
  );
};
