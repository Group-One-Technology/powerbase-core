import React, { useEffect, Fragment } from 'react';
import { useHistory } from 'react-router-dom';
import { InboxIcon } from '@heroicons/react/outline';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import cn from 'classnames';

import { useAuthUser } from '@models/AuthUser';
import { Navbar } from '@components/layout/Navbar';
import { Page } from '@components/layout/Page';
import { PageHeader } from '@components/layout/PageHeader';
import { InlineInput } from '@components/ui/InlineInput';
import { PageContent } from '@components/layout/PageContent';
import { useValidState } from '@lib/hooks/useValidState';
import { REQUIRED_VALIDATOR } from '@lib/validators/REQUIRED_VALIDATOR';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function BasesConnectPage() {
  const history = useHistory();
  const { authUser } = useAuthUser();
  const [databaseName, setDatabaseName, databaseNameError] = useValidState('', REQUIRED_VALIDATOR);

  useEffect(() => {
    if (authUser === null) history.push('/login');
  }, [authUser]);

  if (authUser) {
    return (
      <Page>
        <div className="py-10">
          <PageHeader className="text-center">
            Connect A Database You Own
          </PageHeader>
          <PageContent className="mt-6">
            <div className="max-w-xl mx-auto">
              <InlineInput
                type="text"
                label="Name"
                name="database-name"
                value={databaseName}
                onChange={(evt) => setDatabaseName(evt.target.value)}
                error={databaseNameError.error}
              />
            </div>
          </PageContent>
        </div>
      </Page>
    );
  }

  return <>Loading...</>;
}
