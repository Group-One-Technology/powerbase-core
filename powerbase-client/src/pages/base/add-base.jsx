import React from 'react';

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
                className="sm:w-56 sm:h-60 text-center bg-white rounded-lg shadow divide-y divide-gray-200"
              >
                <BaseSourceItem source={source} />
              </li>
            ))}
          </ul>
        </PageContent>
      </div>
    </Page>
  );
}
