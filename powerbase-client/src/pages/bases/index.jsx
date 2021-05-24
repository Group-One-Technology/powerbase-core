import React, { useEffect, Fragment } from 'react';
import useSWR from 'swr';
import { useHistory, Link } from 'react-router-dom';
import { PlusCircleIcon } from '@heroicons/react/outline';

import { useAuthUser } from '@models/AuthUser';
import { BaseItem } from '@components/bases/BaseItem';

import { Navbar } from '@components/layout/Navbar';
import { Page } from '@components/layout/Page';
import { PageHeader } from '@components/layout/PageHeader';
import { PageContent } from '@components/layout/PageContent';
import { getDatabases } from '@lib/api/databases';
import { EmptyBase } from '@components/bases/EmptyBase';

export function BasesPage() {
  const history = useHistory();
  const authUser = useAuthUser();
  const { data: bases} = useSWR(authUser ? '/databases' : null, getDatabases);

  return (
    <Page authOnly>
      <div className="py-10">
        {bases?.length === 0 && (
          <PageHeader>
            Bases
          </PageHeader>
        )}
        <PageContent>
          {!!bases?.length && (
            <ul className="mt-16 flex flex-col sm:flex-row justify-center flex-wrap gap-6">
              {bases.map((base) => (
                <li
                  key={base.id}
                  className="sm:w-48 sm:h-48 text-center bg-white rounded-lg shadow divide-y divide-gray-200"
                >
                  <BaseItem key={base.id} base={base} />
                </li>
              ))}
              <li className="sm:w-48 sm:h-48 text-center bg-gray-200 rounded-lg shadow divide-y divide-gray-200">
                <Link to="/bases/create" className="h-full">
                  <div className="h-full flex flex-col p-8 items-center justify-center">
                    <PlusCircleIcon className="mt-3 h-12 w-12 text-gray-500" />
                    <p className="mt-2 text-sm text-gray-500">
                      Add New
                    </p>
                  </div>
                </Link>
              </li>
            </ul>
          )}
          {bases?.length === 0 && <EmptyBase />}
        </PageContent>
      </div>
    </Page>
  );
}
