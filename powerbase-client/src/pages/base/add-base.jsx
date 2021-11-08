import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/outline';

import { Page } from '@components/layout/Page';
import { PageHeader } from '@components/layout/PageHeader';
import { PageContent } from '@components/layout/PageContent';
import { BASE_SOURCES } from '@lib/constants/bases';
import { BaseSourceItem } from '@components/bases/BaseSourceItem';

export function AddBasePage() {
  return (
    <Page authOnly>
      <div className="py-10">
        <PageHeader className="text-center">
          Add A Base
        </PageHeader>
        <PageContent>
          <ul className="mt-4 flex flex-col justify-center flex-wrap gap-5 sm:flex-row sm:mx-48">
            {BASE_SOURCES.map((source) => (
              <li
                key={source.name}
                className="sm:w-56 sm:h-56 text-center bg-white rounded-lg shadow"
              >
                <BaseSourceItem source={source} />
              </li>
            ))}
          </ul>

          <div className="w-max mx-auto mt-8">
            <Link to="/" className="flex items-center p-2 bg-white rounded-lg shadow">
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Return
            </Link>
          </div>
        </PageContent>
      </div>
    </Page>
  );
}
