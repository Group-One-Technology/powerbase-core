import React, { useEffect, useReducer } from 'react';
import { useHistory } from 'react-router-dom';

import { useAuthUser } from '@models/AuthUser';
import { Page } from '@components/layout/Page';
import { SetupIntro } from '@components/setup/SetupIntro';
import { SetupAdminForm } from '@components/setup/SetupAdminForm';

export function SetupPage() {
  const history = useHistory();
  const { authUser } = useAuthUser();
  const [isFormStep, nextStep] = useReducer(() => true, false);

  useEffect(() => {
    if (localStorage.signedIn) history.push('/');
  }, [authUser]);

  return (
    <Page title="Setup Powerbase" navbar={false} className="relative h-screen min-h-full overflow-x-hidden">
      {!isFormStep && <SetupIntro nextStep={nextStep} />}
      {isFormStep && <SetupAdminForm />}
    </Page>
  );
}
