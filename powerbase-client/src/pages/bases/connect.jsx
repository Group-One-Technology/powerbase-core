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

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function BasesConnectPage() {
  const { authUser } = useAuthUser();

  useEffect(() => {
    if (authUser === null) history.push('/login');
  }, [authUser]);

  if (authUser) {
    return (
      <Page>
        <div className="py-10">
          <PageHeader>
            Connect A Database You Own
          </PageHeader>
        </div>
      </Page>
    );
  }

  return null;
}
