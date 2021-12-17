import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { RadioGroup } from '@headlessui/react';
import cn from 'classnames';

import { useAuthUser } from '@models/AuthUser';
import { Page } from '@components/layout/Page';
import { PageHeader } from '@components/layout/PageHeader';
import { PageContent } from '@components/layout/PageContent';
import { Loader } from '@components/ui/Loader';

const BASE_SOURCES = [
  {
    name: 'Fresh Base',
    description: 'Build out your table and data from scratch',
    footnote: 'Options: Postgres, MySQL',
    value: 'create',
  },
  {
    pretext: 'Connect Existing',
    name: 'SQL Database',
    footnote: 'Connect your existing mysql or postgres database',
    value: 'existing',
  },
  {
    pretext: 'Start with',
    name: 'Sample Database',
    footnote: 'Try out Powerbase with our sample IMDB database.',
    value: 'sample',
  },
];

export function OnboardingPage() {
  const history = useHistory();
  const { authUser } = useAuthUser();

  const [databaseType, setDatabaseType] = useState(BASE_SOURCES[0]);

  if (!authUser?.isOnboarded) {
    history.push('/');
    return <Loader className="h-screen" />;
  }

  return (
    <Page authOnly>
      <div className="py-10">
        <PageHeader title="Get Started with Powerbase" className="text-center" />
        <PageContent>
          <RadioGroup value={databaseType} onChange={setDatabaseType}>
            <RadioGroup.Label className="sr-only">Database Type</RadioGroup.Label>
            <div className="mx-auto flex justify-center space-y-2 sm:space-x-2 sm:space-y-0 flex-col sm:flex-row sm:h-60 sm:w-[700px]">
              {BASE_SOURCES.map((option) => (
                <RadioGroup.Option
                  key={option.name}
                  value={option}
                  className={({ active }) => (cn(
                    'flex-1 bg-white relative block rounded-lg border border-gray-300 shadow-sm p-4 cursor-pointer hover:border-gray-400 sm:flex sm:justify-between focus:outline-none',
                    active && 'ring-1 ring-offset-2 ring-indigo-500',
                    option.disabled && 'cursor-not-allowed',
                  ))}
                  disabled={option.disabled}
                >
                  {({ checked }) => (
                    <>
                      <div className="w-full flex flex-col items-center justify-center text-center p-2">
                        <RadioGroup.Label as="p" className="mt-4 text-gray-900 text-xl font-bold break-words" style={{ hyphens: 'auto' }}>
                          {option.pretext && (
                            <span className="block text-xs font-normal text-gray-500">{option.pretext}</span>
                          )}
                          {option.name}
                        </RadioGroup.Label>
                        {option.description && (
                          <RadioGroup.Description as="p" className="text-xs text-gray-500">{option.description}</RadioGroup.Description>
                        )}
                        {option.footnote && (
                          <p className="mt-auto text-xs text-gray-500 px-4">{option.footnote}</p>
                        )}
                      </div>
                      <div
                        className={cn('absolute -inset-px rounded-lg border-2 pointer-events-none', (
                          checked ? 'border-indigo-500' : 'border-transparent'
                        ))}
                        aria-hidden="true"
                      />
                    </>
                  )}
                </RadioGroup.Option>
              ))}
            </div>
          </RadioGroup>

          <div className="my-4 flex justify-center">
            <button
              type="button"
              className="border border-transparent font-medium px-6 py-2 text-base rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Setup Database
            </button>
          </div>
        </PageContent>
      </div>
    </Page>
  );
}
