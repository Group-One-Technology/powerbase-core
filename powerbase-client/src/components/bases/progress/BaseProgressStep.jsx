import React from 'react';
import cn from 'classnames';
import { CheckIcon } from '@heroicons/react/solid';
import { Tab } from '@headlessui/react';

import { BASE_PROGRESS_STEPS } from '@lib/constants/base-migrations';

const steps = BASE_PROGRESS_STEPS;

export function BaseProgressStep() {
  return (
    <nav aria-label="Progress" className="mt-14 mb-8">
      <ol className="hidden lg:flex lg:items-center lg:justify-center">
        {steps.map((step, index) => {
          const isLastStep = index === steps.length - 1;

          return (
            <li key={step.name} className={cn('relative', !isLastStep && 'pr-8 sm:pr-20')}>
              {step.status === 'complete' ? (
                <>
                  <p className="w-max absolute -top-6 left-2 transform -translate-x-1/3 text-sm font-medium text-gray-900">
                    {step.name}
                  </p>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-indigo-600" />
                  </div>
                  <Tab
                    className="mr-8 relative w-12 h-12 flex items-center justify-center bg-indigo-600 rounded-full hover:bg-indigo-900 focus:outline-none focus:ring-2 ring-offset-4 ring-offset-indigo-400 ring-white ring-opacity-60"
                  >
                    <CheckIcon className="w-6 h-6 text-white" aria-hidden="true" />
                    <span className="sr-only">{step.name} Complete</span>
                  </Tab>
                </>
              ) : step.status === 'current' ? (
                <>
                  <p className="w-max absolute -top-6 left-2 transform -translate-x-1/3 text-sm font-medium text-indigo-600">
                    {step.name}
                  </p>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-gray-200" />
                  </div>
                  <Tab
                    className="mr-8 relative w-12 h-12 flex items-center justify-center bg-white border-2 border-indigo-600 rounded-full focus:outline-none focus:ring-2 ring-offset-4 ring-offset-indigo-400 ring-white ring-opacity-60"
                  >
                    <span className="h-2.5 w-2.5 bg-indigo-600 rounded-full" aria-hidden="true" />
                    <span className="sr-only">{step.name}</span>
                  </Tab>
                </>
              ) : (
                <>
                  <p className="w-max absolute -top-6 left-2 transform -translate-x-1/3 text-sm text-gray-500">
                    {step.name}
                  </p>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-gray-200" />
                  </div>
                  <Tab
                    className={cn(
                      'relative w-12 h-12 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full cursor-not-allowed hover:border-gray-400',
                      !isLastStep && 'mr-8',
                    )}
                    disabled
                  >
                    <span className="h-2.5 w-2.5 bg-transparent rounded-full" aria-hidden="true" />
                    <span className="sr-only">{step.name}</span>
                  </Tab>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
