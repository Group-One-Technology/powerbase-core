import React from 'react';
import PropTypes from 'prop-types';
import { XCircleIcon } from '@heroicons/react/solid';

export function ErrorAlert({ errors }) {
  const isArray = Array.isArray(errors);

  if (isArray && !errors?.length) {
    return null;
  }

  return (
    <div className="rounded-md bg-red-50 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          {isArray && errors.length > 1
            ? (
              <>
                <h3 className="text-sm font-medium text-red-800">
                  There were {errors.length} error(s) with your submission.
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {errors.map((error) => (
                      <li key={error}>{error}.</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-sm font-medium text-red-800">
                {errors}
              </p>
            )}
        </div>
      </div>
    </div>
  );
}

ErrorAlert.propTypes = {
  errors: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
};
