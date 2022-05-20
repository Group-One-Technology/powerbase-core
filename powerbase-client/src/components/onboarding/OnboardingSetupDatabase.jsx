import React from 'react';
import PropTypes from 'prop-types';
import { RadioGroup } from '@headlessui/react';
import { Chunk } from 'editmode-react';
import { useHistory } from 'react-router-dom';
import cn from 'classnames';
import * as Tabs from '@radix-ui/react-tabs';

import { BASE_SOURCES, OnboardingTabs } from '@lib/constants/onboarding';
import { POWERBASE_TYPE } from '@lib/constants/bases';
import { inviteGuestToSampleDatabase } from '@lib/api/guests';
import { setAuthUserAsOnboarded } from '@lib/api/auth';
import { useSaveStatus } from '@models/SaveStatus';
import { Button } from '@components/ui/Button';
import { useAuthUser } from '@models/AuthUser';
import { useSharedBases } from '@models/SharedBases';

export function OnboardingSetupDatabase({
  databaseType,
  setDatabaseType,
  powerbaseType,
  setPowerbaseType,
  setCurrentTab,
  sampleDatabase,
}) {
  const history = useHistory();
  const { authUser, mutate: mutateAuthUser } = useAuthUser();
  const { mutate: mutateSharedBases } = useSharedBases();
  const {
    saving, saved, loading, catchError,
  } = useSaveStatus();
  const sampleDatabaseId = sampleDatabase?.id;

  const baseSources = sampleDatabaseId == null
    ? BASE_SOURCES.map((item) => ({
      ...item,
      disabled: item.value === 'sample'
        ? true
        : item.disabled,
    }))
    : BASE_SOURCES.map((item) => ({
      ...item,
      footnote: item.value === 'sample' && sampleDatabase?.name.length
        ? `Try out Powerbase with our sample ${sampleDatabase.name} database.`
        : item.footnote,
    }));

  const handleNextStep = async () => {
    if (databaseType.name === 'Sample Database') {
      if (!databaseType.disabled && sampleDatabaseId != null) {
        try {
          saving();
          await inviteGuestToSampleDatabase();
          await setAuthUserAsOnboarded();
          mutateAuthUser({ ...authUser, isOnboarded: true });
          mutateSharedBases();
          history.push(`/base/${sampleDatabaseId}`);
          saved('Successfully been invited to the sample database.');
        } catch (err) {
          catchError(err);
        }
      } else {
        catchError('There is no sample database.');
      }
    } else {
      setCurrentTab(OnboardingTabs.CONNECT_DATABASE);
    }
  };

  return (
    <Tabs.Content value={OnboardingTabs.SETUP_DATABASE}>
      <p className="mt-8 mb-4 text-center text-base text-gray-600">
        <Chunk identifier="onboarding_database_type_description">
          Start managing your database by
        </Chunk>
      </p>
      <RadioGroup value={databaseType} onChange={setDatabaseType}>
        <RadioGroup.Label className="sr-only">Database Type</RadioGroup.Label>
        <div className="mx-auto flex justify-center space-y-2 sm:space-x-2 sm:space-y-0 flex-col sm:flex-row sm:h-60 sm:w-[700px]">
          {baseSources.map((option) => (
            <RadioGroup.Option
              key={option.name}
              value={option}
              className={({ active }) => (cn(
                'flex-1 bg-white relative block rounded-lg border border-gray-300 shadow-sm py-4 px-2 cursor-pointer hover:border-gray-400 sm:flex sm:justify-between focus:outline-none',
                active && 'ring-1 ring-offset-2 ring-indigo-500',
                option.disabled && 'bg-gray-100 cursor-not-allowed',
              ))}
              disabled={option.disabled}
            >
              {({ checked }) => (
                <>
                  <div className="w-full flex flex-col items-center justify-center text-center p-2">
                    {option.disabled && (
                      <p className="text-xs text-gray-600 px-4">Coming Soon</p>
                    )}
                    <RadioGroup.Label as="p" className="mt-4 text-gray-900 text-xl font-bold break-words" style={{ hyphens: 'auto' }}>
                      {option.pretext && (
                        <span className="block text-xs font-normal text-gray-600">{option.pretext}</span>
                      )}
                      {option.name}
                    </RadioGroup.Label>
                    {option.description && (
                      <RadioGroup.Description as="p" className="text-xs text-gray-600">{option.description}</RadioGroup.Description>
                    )}
                    {option.footnote && (
                      <p className="mt-auto text-xs text-gray-600 px-4">{option.footnote}</p>
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

      {databaseType.name !== 'Sample Database' && (
        <>
          <p className="mt-8 mb-6 text-center text-base text-gray-600">
            <Chunk identifier="onboarding_powerbase_type_description">
              You can supercharge your database by making it Turbo.
            </Chunk>
          </p>
          <RadioGroup value={powerbaseType} onChange={setPowerbaseType}>
            <RadioGroup.Label className="sr-only">Powerbase Type</RadioGroup.Label>
            <div className="mx-auto w-full flex justify-center space-y-2 sm:space-x-2 sm:space-y-0 flex-col sm:flex-row sm:w-96">
              {POWERBASE_TYPE.map((option) => (
                <RadioGroup.Option
                  key={option.name}
                  value={option}
                  className={cn(
                    'flex-1 px-6 py-2 font-medium text-base rounded-md text-center cursor-pointer',
                    powerbaseType.name === option.name
                      ? 'bg-indigo-100 text-indigo-700'
                      : ' bg-gray-200 text-gray-600 hover:text-gray-700 focus:text-gray-700 hover:bg-gray-300 focus:bg-gray-300',
                  )}
                >
                  <Chunk identifier={option.nameId}>
                    {option.name}
                  </Chunk>
                </RadioGroup.Option>
              ))}
            </div>
          </RadioGroup>

          <div className="min-h-[33rem] my-4">
            <p className="mx-auto max-w-md my-2 px-8 text-center text-sm text-gray-600">
              <Chunk identifier={powerbaseType.descriptionId}>
                {powerbaseType.description}
              </Chunk>
            </p>
            <img
              src={`/public/img/${powerbaseType.name === 'Powerbase Turbo' ? 'turbo' : 'non-turbo'}-diagram.png`}
              alt={`${powerbaseType.name} diagram`}
              className="my-4 mx-auto max-w-3xl w-full"
            />
            <dl className="mx-auto max-w-md my-4 px-1 flex flex-col space-y-4">
              {powerbaseType.features.map((feature) => (
                <div key={feature.name} className="flex flex-row space-x-4">
                  <div className="flex items-center justify-center h-10 w-16 rounded-md bg-indigo-500 text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <dt className="text-base leading-6 font-medium text-gray-900">
                      <Chunk identifier={feature.nameId}>
                        {feature.name}
                      </Chunk>
                    </dt>
                    <dd className="mt-2 text-sm text-gray-600">
                      <Chunk identifier={feature.descriptionId}>
                        {feature.description}
                      </Chunk>
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </>
      )}

      <div className="my-4 flex justify-center">
        <Button
          type="button"
          className="inline-flex items-center justify-center border border-transparent font-medium px-6 py-2 text-base rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={handleNextStep}
          loading={loading}
        >
          {databaseType.name !== 'Sample Database'
            ? (
              <Chunk identifier="onboarding_setup_button">
                Setup Database
              </Chunk>
            ) : (
              <Chunk identifier="onboarding_setup_sample_db_button">
                View Sample Base
              </Chunk>
            )}
        </Button>
      </div>
    </Tabs.Content>
  );
}

OnboardingSetupDatabase.propTypes = {
  databaseType: PropTypes.object.isRequired,
  setDatabaseType: PropTypes.func.isRequired,
  powerbaseType: PropTypes.object.isRequired,
  setPowerbaseType: PropTypes.func.isRequired,
  setCurrentTab: PropTypes.func.isRequired,
  sampleDatabase: PropTypes.any,
};
