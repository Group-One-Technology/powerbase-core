import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import Gravatar from 'react-gravatar';
import PropTypes from 'prop-types';
import cn from 'classnames';

import { useAuthUser } from '@models/AuthUser';
import { IBase } from '@lib/propTypes/base';
import { UserMenu } from './UserMenu';

export function MobileNav({ base, bases, navigation }) {
  const location = useLocation();
  const { authUser } = useAuthUser();

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
            <p className="text-xs px-4 py-2 text-white text-opacity-80 uppercase">
              Other Bases
            </p>
            {bases.map((item) => (
              <Link
                key={item.name}
                to={`/base/${item.id}`}
                className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-white hover:bg-gray-100 hover:bg-opacity-30 hover:border-current"
              >
                {item.name}
              </Link>
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
              className="h-6 w-6 rounded-full"
              alt={`${authUser.firstName}'s profile picture`}
            />
          </div>
          <div className="ml-3">
            <div className={cn('text-base font-medium', base ? 'text-white' : 'text-gray-800')}>{authUser.name}</div>
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
