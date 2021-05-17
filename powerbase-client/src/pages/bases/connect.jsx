import React, { useEffect, Fragment, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { InboxIcon } from '@heroicons/react/outline';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import cn from 'classnames';

import { useAuthUser } from '@models/AuthUser';
import { useValidState } from '@lib/hooks/useValidState';
import { REQUIRED_VALIDATOR } from '@lib/validators/REQUIRED_VALIDATOR';
import { DATABASE_TYPES } from '@lib/constants';

import { Navbar } from '@components/layout/Navbar';
import { Page } from '@components/layout/Page';
import { PageHeader } from '@components/layout/PageHeader';
import { InlineInput } from '@components/ui/InlineInput';
import { PageContent } from '@components/layout/PageContent';
import { InlineSelect } from '@components/ui/InlineSelect';

export function BasesConnectPage() {
  const history = useHistory();
  const [databaseName, setDatabaseName, databaseNameError] = useValidState('', REQUIRED_VALIDATOR);
  const [databaseType, setDatabaseType] = useState(DATABASE_TYPES[0]);

  return (
    <Page authOnly>
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
            <InlineSelect
              label="Type"
              value={databaseType}
              setValue={setDatabaseType}
              options={DATABASE_TYPES}
            />
          </div>
        </PageContent>
      </div>
    </Page>
  );
}
