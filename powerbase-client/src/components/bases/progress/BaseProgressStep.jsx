import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { useMediaQuery } from 'react-responsive';
import { CheckIcon } from '@heroicons/react/solid';
import * as Tabs from '@radix-ui/react-tabs';

import { useBase } from '@models/Base';
import { MOBILE_DEVICES } from '@lib/constants/breakpoints';

export function BaseProgressStep({ steps, currentStep }) {
  const { data: base } = useBase();
  const isMobile = useMediaQuery({ query: MOBILE_DEVICES });

  if (isMobile) {
    return (
      <nav className="mt-14 mb-8">
        <Tabs.List aria-label="migration progress tabs">
          <ol>
            {steps.map((step, index) => {
              const isLastStep = index === steps.length - 1;
              let status = 'complete';

              if (!base.isMigrated) {
                status = currentStep.id === step.id
                  ? 'current'
                  : currentStep.id > step.id
                    ? 'complete'
                    : 'upcoming';
              }

              return (
                <li key={step.name} className={cn('relative', !isLastStep && 'pb-4')}>
                  {status === 'complete' ? (
                    <>
                      {!isLastStep && <div className="-ml-px absolute mt-0.5 top-4 left-4 w-0.5 h-full bg-indigo-600" aria-hidden="true" />}
                      <Tabs.Trigger value={step.value} className={cn('relative flex items-start group', step.disabled && 'cursor-not-allowed')} disabled={step.disabled}>
                        <span className="h-9 flex items-center">
                          <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-indigo-600 rounded-full group-focus:ring-2 group-focus:outline-none ring-offset-2 ring-offset-indigo-400 ring-white ring-opacity-60">
                            <CheckIcon className="w-5 h-5 text-white" aria-hidden="true" />
                          </span>
                        </span>
                        <span className="ml-4 mt-3 min-w-0 text-xs font-semibold tracking-wide uppercase">{step.name}</span>
                      </Tabs.Trigger>
                    </>
                  ) : status === 'current' ? (
                    <>
                      {!isLastStep && <div className="-ml-px absolute mt-0.5 top-4 left-4 w-0.5 h-full bg-gray-300" aria-hidden="true" />}
                      <Tabs.Trigger value={step.value} className="relative flex items-start group">
                        <span className="h-9 flex items-center" aria-hidden="true">
                          <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-white border-2 border-indigo-600 rounded-full group-focus:ring-2 group-focus:outline-none ring-offset-2 ring-offset-indigo-400 ring-white ring-opacity-60">
                            <span className="h-2.5 w-2.5 bg-indigo-600 rounded-full" />
                          </span>
                        </span>
                        <span className="ml-4 mt-3 min-w-0 text-xs font-semibold tracking-wide uppercase text-indigo-600">{step.name}</span>
                      </Tabs.Trigger>
                    </>
                  ) : (
                    <>
                      {!isLastStep && <div className="-ml-px absolute mt-0.5 top-4 left-4 w-0.5 h-full bg-gray-300" aria-hidden="true" />}
                      <Tabs.Trigger value={step.value} className="relative flex items-start" disabled>
                        <span className="h-9 flex items-center" aria-hidden="true">
                          <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full">
                            <span className="h-2.5 w-2.5 bg-transparent rounded-full g" />
                          </span>
                        </span>
                        <span className="ml-4 mt-3 min-w-0 text-xs font-semibold tracking-wide uppercase text-gray-500">{step.name}</span>
                      </Tabs.Trigger>
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </Tabs.List>
      </nav>
    );
  }

  return (
    <nav className="mt-14 mb-8">
      <Tabs.List aria-label="migration progress tabs">
        <ol className="flex items-center justify-center">
          {steps.map((step, index) => {
            const isLastStep = index === steps.length - 1;
            const status = currentStep.id > step.id || currentStep.value === 'migrated'
              ? 'complete'
              : currentStep.id === step.id
                ? 'current'
                : 'upcoming';

            return (
              <li key={step.name} className={cn('relative', !isLastStep && 'pr-8 sm:pr-20')}>
                {status === 'complete' ? (
                  <>
                    <p className="w-max absolute -top-6 left-2 transform -translate-x-1/3 text-sm font-medium text-gray-900">
                      {step.name}
                    </p>
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-indigo-600" />
                    </div>
                    <Tabs.Trigger
                      value={step.value}
                      className={cn(
                        'relative w-12 h-12 flex items-center justify-center bg-indigo-600 rounded-full hover:bg-indigo-900 focus:outline-none focus:ring-2 ring-offset-4 ring-offset-indigo-400 ring-white ring-opacity-60',
                        step.disabled && 'cursor-not-allowed',
                        !isLastStep && 'mr-8',
                      )}
                      disabled={step.disabled}
                    >
                      <CheckIcon className="w-6 h-6 text-white" aria-hidden="true" />
                      <span className="sr-only">{step.name} Complete</span>
                    </Tabs.Trigger>
                  </>
                ) : status === 'current' ? (
                  <>
                    <p className="w-max absolute -top-6 left-2 transform -translate-x-1/3 text-sm font-medium text-indigo-600">
                      {step.name}
                    </p>
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-gray-200" />
                    </div>
                    <Tabs.Trigger
                      value={step.value}
                      className={cn(
                        'relative w-12 h-12 flex items-center justify-center bg-white border-2 border-indigo-600 rounded-full focus:outline-none focus:ring-2 ring-offset-4 ring-offset-indigo-400 ring-white ring-opacity-60',
                        !isLastStep && 'mr-8',
                      )}
                    >
                      <span className="h-2.5 w-2.5 bg-indigo-600 rounded-full" aria-hidden="true" />
                      <span className="sr-only">{step.name}</span>
                    </Tabs.Trigger>
                  </>
                ) : (
                  <>
                    <p className="w-max absolute -top-6 left-2 transform -translate-x-1/3 text-sm text-gray-500">
                      {step.name}
                    </p>
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-gray-200" />
                    </div>
                    <Tabs.Trigger
                      value={step.value}
                      className={cn(
                        'relative w-12 h-12 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full cursor-not-allowed hover:border-gray-400',
                        !isLastStep && 'mr-8',
                      )}
                      disabled
                    >
                      <span className="h-2.5 w-2.5 bg-transparent rounded-full" aria-hidden="true" />
                      <span className="sr-only">{step.name}</span>
                    </Tabs.Trigger>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </Tabs.List>
    </nav>
  );
}

BaseProgressStep.propTypes = {
  steps: PropTypes.array.isRequired,
  currentStep: PropTypes.object.isRequired,
};
