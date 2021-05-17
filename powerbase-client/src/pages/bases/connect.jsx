import React, { useEffect, Fragment, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { RadioGroup } from '@headlessui/react';
import { InboxIcon } from '@heroicons/react/outline';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import cn from 'classnames';

import { useAuthUser } from '@models/AuthUser';
import { useValidState } from '@lib/hooks/useValidState';
import { REQUIRED_VALIDATOR } from '@lib/validators/REQUIRED_VALIDATOR';
import { DATABASE_TYPES, DB_PLATFORMS } from '@lib/constants';

import { Navbar } from '@components/layout/Navbar';
import { Page } from '@components/layout/Page';
import { PageHeader } from '@components/layout/PageHeader';
import { InlineInput } from '@components/ui/InlineInput';
import { PageContent } from '@components/layout/PageContent';
import { InlineSelect } from '@components/ui/InlineSelect';
import { InlineRadio } from '@components/ui/InlineRadio';
import { InlineColorRadio } from '@components/ui/InlineColorRadio';

export function BasesConnectPage() {
  const history = useHistory();
  const [databaseName, setDatabaseName, databaseNameError] = useValidState('', REQUIRED_VALIDATOR);
  const [databaseType, setDatabaseType] = useState(DATABASE_TYPES[0]);
  const [databasePlatform, setDatabasePlatform] = useState(DB_PLATFORMS[0]);
  const [color, setColor] = useState('');

  return (
    <Page authOnly>
      <div className="py-10">
        <PageHeader className="text-center">
          Connect A Database You Own
        </PageHeader>
        <PageContent className="mt-6">
          <div className="max-w-2xl mx-auto">
            <InlineInput
              type="text"
              label="Name"
              name="database-name"
              placeholder="e.g. powerbase"
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
            <InlineRadio
              label="Where"
              aria-label="Cloud Platform"
              value={databasePlatform}
              setValue={setDatabasePlatform}
              options={DB_PLATFORMS}
              enhancer={(option) => !!option.price && (
                <RadioGroup.Description as="div" className="mt-2 flex text-sm sm:mt-0 sm:block sm:ml-4 sm:text-right">
                  <div className="font-medium text-gray-900">{option.price}</div>
                  <div className="ml-1 text-gray-500 sm:ml-0">/mo</div>
                </RadioGroup.Description>
              )}
            />
            <InlineColorRadio value={color} setValue={setColor} />
          </div>
        </PageContent>
      </div>
    </Page>
  );
}
