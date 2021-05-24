import React, { Fragment } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { MenuIcon, XIcon } from '@heroicons/react/outline';
import cn from 'classnames';

import { useAuthUser } from '@models/AuthUser';
import { logout } from '@lib/api/auth';
import { UserMenu } from './UserMenu';

const NAVIGATION = [
  { name: 'Bases', href: '/' },
  { name: 'Team', href: '/team' },
  { name: 'Settings', href: '/settings' },
];

export function Navbar({ base }) {
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
            <div className="flex justify-between items-center h-12">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <img src="/public/img/logo.svg" alt="Powerbase logo" className="block h-5 w-auto" />
                </div>
              </div>
              <div className={cn('hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8', { 'h-full': !base })}>
                {base && (
                  <h1 className="text-lg font-semibold">
                    {base.name}
                  </h1>
                )}
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
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <UserMenu />
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
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
            <div className="pt-2 pb-3 space-y-1">
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
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <img
                    src={authUser.displayPhotoUrl}
                    alt={`${authUser.firstName}'s profile picture`}
                    className="h-4 w-4 rounded-full"
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
