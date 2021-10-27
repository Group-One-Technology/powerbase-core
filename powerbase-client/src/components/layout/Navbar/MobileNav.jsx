import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import Gravatar from 'react-gravatar';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { CogIcon, ShareIcon } from '@heroicons/react/outline';

import { useAuthUser } from '@models/AuthUser';
import { useShareBaseModal } from '@models/modals/ShareBaseModal';
import { IBase } from '@lib/propTypes/base';
import { Badge } from '@components/ui/Badge';
import { UserMenu } from './UserMenu';

export function MobileNav({ base, bases, navigation }) {
  const location = useLocation();
  const { authUser } = useAuthUser();
  const { setOpen: setShareModalOpen } = useShareBaseModal();

  const handleShareBase = () => {
    setShareModalOpen(true);
  };

  return (
    <Disclosure.Panel className="sm:hidden pb-3">
      <div className="pb-3 space-y-1">
        {!!bases?.length && (
          <>
            <p
              className={cn(
                'block pl-3 pr-4 py-2 border-l-4 text-base font-medium bg-gray-100 bg-opacity-30 border-current',
              )}
            >
              {base.name}
            </p>
            <button
              type="button"
              className="w-full pl-3 pr-4 py-2 border-l-4 flex items-center text-base font-medium border-transparent text-white hover:bg-gray-100 hover:bg-opacity-30 hover:border-current"
              onClick={handleShareBase}
            >
              <ShareIcon className="h-4 w-4 mr-2" />
              Share Base
            </button>
            <Link
              to={`/base/${base.id}/settings`}
              className="pl-3 pr-4 py-2 border-l-4 flex items-center text-base font-medium border-transparent text-white hover:bg-gray-100 hover:bg-opacity-30 hover:border-current"
            >
              <CogIcon className="h-4 w-4 mr-2" />
              Settings
            </Link>
            <p className="text-xs px-4 py-2 text-white text-opacity-80 uppercase">
              Other Bases
            </p>
            {bases.map((item) => (
              item.isMigrated
                ? (
                  <Link
                    key={item.name}
                    to={`/base/${item.id}`}
                    className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-white hover:bg-gray-100 hover:bg-opacity-30 hover:border-current"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <p
                    key={item.name}
                    className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-white hover:bg-gray-100 hover:bg-opacity-30 hover:border-current"
                  >
                    {item.name}
                    <Badge className="ml-2 text-white bg-yellow-400">Migrating</Badge>
                  </p>
                )
            ))}
          </>
        )}
        {!base && navigation.map((item) => {
          const isCurrentItem = location.pathname === item.href;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn('block pl-3 pr-4 py-2 border-l-4 text-base font-medium', (
                isCurrentItem
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              ))}
              aria-current={isCurrentItem ? 'page' : undefined}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
      <div className={cn('pt-4 pb-3 border-b border-t border-gray-200', base ? 'border-opacity-30' : '')}>
        <div className="flex items-center px-4">
          <div className="flex-shrink-0">
            <Gravatar
              email={authUser.email}
              className="h-10 w-10 rounded-full"
              alt={`${authUser.firstName}'s profile picture`}
            />
          </div>
          <div className="ml-3">
            <div className={cn('text-base font-medium', base ? 'text-white' : 'text-gray-800')}>
              {authUser.firstName} {authUser.lastName}
            </div>
            <div className={cn('text-sm font-medium', base ? 'text-white' : 'text-gray-500')}>{authUser.email}</div>
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <UserMenu list colored={!!base} />
        </div>
      </div>
    </Disclosure.Panel>
  );
}

MobileNav.propTypes = {
  base: IBase,
  bases: PropTypes.arrayOf(IBase),
  navigation: PropTypes.arrayOf(PropTypes.object).isRequired,
};
