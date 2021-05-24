import React, { Fragment } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { MenuIcon, XIcon } from '@heroicons/react/outline';
import Gravatar from 'react-gravatar';
import cn from 'classnames';

import { useAuthUser } from '@models/AuthUser';
import { logout } from '@lib/api/auth';
import { UserMenu } from './UserMenu';
import { BaseMenu } from './BaseMenu';

const NAVIGATION = [
  { name: 'Bases', href: '/' },
  { name: 'Team', href: '/team' },
  { name: 'Settings', href: '/settings' },
];

export function Navbar({ base, bases }) {
  const location = useLocation();
  const { authUser, mutate } = useAuthUser();

  if (!authUser) {
    return null;
  }

  return (
    <Disclosure as="nav" className={cn('bg-white', { 'shadow-sm': !base })}>
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex sm:grid sm:grid-cols-3 justify-between items-center h-12">
              <div className="col-span-1">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/">
                    <img src="/public/img/logo.svg" alt="Powerbase logo" className="block h-5 w-auto" />
                  </Link>
                </div>
              </div>
              <div className={cn('hidden sm:col-span-1 sm:justify-center sm:-my-px sm:flex sm:space-x-8', { 'h-full': !base })}>
                {base && <BaseMenu base={base} bases={bases} />}
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
                <UserMenu />
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="bg-white inline-flex items-center justify-center p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
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

          <Disclosure.Panel className="sm:hidden">
            <div className="pb-3 space-y-1">
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
            <div className="pt-4 pb-3 border-b border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <Gravatar
                    email={authUser.email}
                    className="h-6 w-6 rounded-full"
                    alt={`${authUser.firstName}'s profile picture`}
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{authUser.name}</div>
                  <div className="text-sm font-medium text-gray-500">{authUser.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <UserMenu list />
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
