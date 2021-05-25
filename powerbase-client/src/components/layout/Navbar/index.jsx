import React, { Fragment } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { MenuIcon, XIcon } from '@heroicons/react/outline';
import Gravatar from 'react-gravatar';
import cn from 'classnames';
import PropTypes from 'prop-types';

import { useAuthUser } from '@models/AuthUser';
import { IBase } from '@lib/propTypes/base';
import { BG_COLORS } from '@lib/constants';
import { UserMenu } from './UserMenu';
import { BaseMenu } from './BaseMenu';

const NAVIGATION = [
  { name: 'Bases', href: '/' },
  { name: 'Team', href: '/team' },
  { name: 'Settings', href: '/settings' },
];

export function Navbar({ base, bases }) {
  const location = useLocation();
  const { authUser } = useAuthUser();
  const otherBases = base && bases
    ? bases.filter((item) => item.id !== base.id)
    : undefined;

  if (!authUser) {
    return null;
  }

  return (
    <Disclosure
      as="nav"
      className={cn({
        'bg-white': !base,
        'shadow-sm': !base,
        'text-white': base,
      }, base && BG_COLORS[base.color])}
    >
      {({ open }) => (
        <>
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex sm:grid sm:grid-cols-3 justify-between items-center h-12">
              <div className="col-span-1">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/">
                    <img src={`/public/img/${base ? 'logo-white' : 'logo'}.svg`} alt="Powerbase logo" className="block h-5 w-auto" />
                  </Link>
                </div>
              </div>
              <div className={cn('hidden sm:col-span-1 sm:justify-center sm:-my-px sm:flex sm:space-x-8', { 'h-full': !base })}>
                {base && <BaseMenu base={base} otherBases={otherBases} />}
                {!base && NAVIGATION.map((item) => {
                  const isCurrentItem = location.pathname === item.href;

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn('inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium', (
                        isCurrentItem
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      ))}
                      aria-current={isCurrentItem ? 'page' : undefined}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              <div className="hidden sm:col-span-1 sm:justify-end sm:ml-6 sm:flex sm:items-center">
                <UserMenu colored={!!base} />
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button
                  className={cn(
                    'inline-flex items-center justify-center p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-current',
                    base
                      ? 'base-transparent text-white hover:bg-opacity-10 hover:bg-gray-100 '
                      : 'bg-white text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:ring-offset-2',
                  )}
                >
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden pb-3">
            <div className="pb-3 space-y-1">
              {!!otherBases?.length && (
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
                  {otherBases.map((item) => (
                    <Link
                      key={item.name}
                      to={`/bases/${item.id}`}
                      className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-white hover:bg-gray-100 hover:bg-opacity-30 hover:border-current"
                    >
                      {item.name}
                    </Link>
                  ))}
                </>
              )}
              {!base && NAVIGATION.map((item) => {
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
        </>
      )}
    </Disclosure>
  );
}

Navbar.propTypes = {
  base: IBase,
  bases: PropTypes.arrayOf(IBase),
};
