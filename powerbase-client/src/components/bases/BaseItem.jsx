import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  ChevronRightIcon,
  ExclamationCircleIcon,
  LightningBoltIcon,
  UserIcon,
} from '@heroicons/react/outline';
import * as Tooltip from '@radix-ui/react-tooltip';

import { IBase } from '@lib/propTypes/base';
import { Badge } from '@components/ui/Badge';

export function BaseItem({ base, handleErrorClick }) {
  const totalCollaborators = 0;

  return (
    <div className="relative p-2 h-full flex flex-col justify-center">
      <div className="absolute top-1 right-1 flex gap-1.5">
        {base.isTurbo && (
          <Tooltip.Root delayDuration={0}>
            <Tooltip.Trigger className="py-[1px] px-0.5 bg-gray-100 rounded text-gray-500">
              <span className="sr-only">Turbo Mode</span>
              <LightningBoltIcon className="h-4 w-4" />
            </Tooltip.Trigger>
            <Tooltip.Content className="py-1 px-2 bg-gray-900 text-white text-xs rounded">
              <Tooltip.Arrow className="gray-900" />
              Turbo Mode
            </Tooltip.Content>
          </Tooltip.Root>
        )}
        {totalCollaborators > 0 && (
          <button
            type="button"
            className="py-[1px] px-0.5 flex items-center bg-gray-100 rounded text-sm text-gray-500"
          >
            {totalCollaborators}
            <UserIcon className="h-4 w-4" />
          </button>
        )}
      </div>
      <Link to={`/base/${base.id}`}>
        <h2 className="text-gray-900 text-lg font-bold uppercase break-words" style={{ hyphens: 'auto' }}>{base.name}</h2>
        {base.isMigrated
          ? (
            <>
              <dl className="mt-1">
                <dt className="sr-only text-sm">No. of Tables</dt>
                <dd className="text-gray-500 text-xs">{base.totalTables} tables</dd>
              </dl>
              <p className="mt-1 font-medium text-xs text-indigo-600 hover:text-indigo-500 inline-flex items-center">
                View
                <ChevronRightIcon className="ml-0.5 h-4 w-4" />
              </p>
            </>
          )
          : <div><Badge color="yellow" className="mt-2">Migrating</Badge></div>}
      </Link>
      {(base.logs.errors?.length > 0) && (
        <button
          type="button"
          className="mt-1 font-medium text-sm text-red-600 hover:text-red-500 flex justify-center items-center"
          onClick={() => handleErrorClick(base)}
        >
          <ExclamationCircleIcon className="-ml-2 mr-1 h-4 w-4" />
          Errors
        </button>
      )}
    </div>
  );
}

BaseItem.propTypes = {
  base: IBase.isRequired,
  handleErrorClick: PropTypes.func.isRequired,
};
