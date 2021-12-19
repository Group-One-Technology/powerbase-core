import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  ChevronRightIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  LightningBoltIcon,
  UserIcon,
} from '@heroicons/react/outline';
import * as Tooltip from '@radix-ui/react-tooltip';

import { IBase } from '@lib/propTypes/base';
import { Badge } from '@components/ui/Badge';

export function BaseItem({
  base,
  mutate,
  handleErrorClick,
  showOwner,
}) {
  return (
    <div className="relative p-2 h-full flex flex-col justify-center">
      <div className="absolute top-1 right-1 flex">
        {base.isTurbo && (
          <Tooltip.Root delayDuration={0}>
            <Tooltip.Trigger className="py-[1px] px-0.5 rounded text-gray-500">
              <span className="sr-only">Turbo Mode</span>
              <LightningBoltIcon className="h-4 w-4" />
            </Tooltip.Trigger>
            <Tooltip.Content className="py-1 px-2 bg-gray-900 text-white text-xs rounded">
              <Tooltip.Arrow className="gray-900" />
              Turbo Mode
            </Tooltip.Content>
          </Tooltip.Root>
        )}
        {base.totalCollaborators > 1 && (
          <button
            type="button"
            className="py-[1px] px-0.5 flex items-center bg-gray-100 rounded text-xs text-gray-500"
          >
            {base.totalCollaborators}
            <UserIcon className="h-4 w-4" />
          </button>
        )}
        {!base.isMigrated && (
          <Link
            to={`/base/${base.id}/progress`}
            className="py-[1px] px-0.5 flex items-center rounded text-xs text-gray-500 hover:bg-gray-100 focus:bg-gray-100"
          >
            <InformationCircleIcon className="h-4 w-4" />
          </Link>
        )}
      </div>
      <Link to={`/base/${base.id}${base.defaultTable ? `/table/${base.defaultTable.id}?view=${base.defaultTable.defaultViewId}` : ''}`}>
        <h2 className="text-gray-900 text-lg font-bold uppercase break-words" style={{ hyphens: 'auto' }}>{base.name}</h2>
        {showOwner && (
          <p className="text-xs text-gray-500 truncate">
            Owned by {base.owner.firstName}
          </p>
        )}
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
          onClick={() => handleErrorClick(base, mutate)}
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
  mutate: PropTypes.func.isRequired,
  handleErrorClick: PropTypes.func.isRequired,
  showOwner: PropTypes.bool,
};
