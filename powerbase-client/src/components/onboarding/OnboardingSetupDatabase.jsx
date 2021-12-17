import React from 'react';
import PropTypes from 'prop-types';
import { RadioGroup } from '@headlessui/react';
import cn from 'classnames';
import * as Tabs from '@radix-ui/react-tabs';
import { BASE_SOURCES, OnboardingTabs } from '@lib/constants/onboarding';
import { POWERBASE_TYPE } from '@lib/constants/bases';

export function OnboardingSetupDatabase({
  databaseType,
  setDatabaseType,
  powerbaseType,
  setPowerbaseType,
}) {
  return (
    <Tabs.Content value={OnboardingTabs.SETUP_DATABASE}>
      <p className="mt-8 mb-4 text-center text-base text-gray-500">
        Start managing your database by
      </p>
      <RadioGroup value={databaseType} onChange={setDatabaseType}>
        <RadioGroup.Label className="sr-only">Database Type</RadioGroup.Label>
        <div className="mx-auto flex justify-center space-y-2 sm:space-x-2 sm:space-y-0 flex-col sm:flex-row sm:h-60 sm:w-[700px]">
          {BASE_SOURCES.map((option) => (
            <RadioGroup.Option
              key={option.name}
              value={option}
              className={({ active }) => (cn(
                'flex-1 bg-white relative block rounded-lg border border-gray-300 shadow-sm py-4 px-2 cursor-pointer hover:border-gray-400 sm:flex sm:justify-between focus:outline-none',
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

      <p className="mt-8 mb-6 text-center text-base text-gray-500">
        You can supercharge your database by making it <strong>Turbo</strong>.
      </p>
      <RadioGroup value={powerbaseType} onChange={setPowerbaseType}>
        <RadioGroup.Label className="sr-only">Powerbase Type</RadioGroup.Label>
        <div className="mx-auto w-96 flex justify-center space-y-2 sm:space-x-2 sm:space-y-0 flex-col sm:flex-row">
          {POWERBASE_TYPE.map((option) => (
            <RadioGroup.Option
              key={option.name}
              value={option}
              className={cn(
                'flex-1 px-6 py-2 font-medium text-base rounded-md text-center',
                powerbaseType.name === option.name
                  ? 'bg-indigo-100 text-indigo-700'
                  : ' bg-gray-200 text-gray-500 hover:text-gray-700 focus:text-gray-700 hover:bg-gray-300 focus:bg-gray-300',
              )}
            >
              {option.name}
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>

      <div className="min-h-[15rem] my-4 mx-auto max-w-md">
        <p className="my-2 px-8 text-center text-sm text-gray-500">
          {powerbaseType.description}
        </p>
        <dl className="my-4 flex flex-col space-y-4">
          {powerbaseType.features.map((feature) => (
            <div key={feature.name} className="flex flex-row space-x-4">
              <div className="flex items-center justify-center h-10 w-16 rounded-md bg-indigo-500 text-white">
                <feature.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <dt p className="text-base leading-6 font-medium text-gray-900">{feature.name}</dt>
                <dd className="mt-2 text-sm text-gray-500">{feature.description}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>

      <div className="my-4 flex justify-center">
        <button
          type="button"
          className="border border-transparent font-medium px-6 py-2 text-base rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Setup Database
        </button>
      </div>
    </Tabs.Content>
  );
}

OnboardingSetupDatabase.propTypes = {
  databaseType: PropTypes.object.isRequired,
  setDatabaseType: PropTypes.func.isRequired,
  powerbaseType: PropTypes.object.isRequired,
  setPowerbaseType: PropTypes.func.isRequired,
};
