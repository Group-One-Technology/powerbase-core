import React, { Fragment } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { BellIcon, MenuIcon, XIcon } from '@heroicons/react/outline';
import cn from 'classnames';

import logoImg from '@public/img/logo.svg';
import { useAuthUser } from '@models/AuthUser';

const NAVIGATION = [
  { name: 'Bases', href: '/' },
  { name: 'Team', href: '/team' },
  { name: 'Settings', href: '/settings' },
];

const USER_NAVIGATION = [
  { name: 'Profile', href: '/profile' },
  { name: 'Settings', href: '/settings' },
];

export function Navbar() {
  const history = useHistory();
  const location = useLocation();
  const { authUser, setAuthUser } = useAuthUser();

  const logout = () => {
    setAuthUser(null);
    history.push('/login');
  };

  return (
    <Disclosure as="nav" className="bg-white shadow-sm">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <img src={logoImg} alt="Powerbase logo" className="block h-8 w-auto" />
                </div>
              </div>
              <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                {NAVIGATION.map((item) => {
                  const isCurrentItem = location.pathname === item.href;

                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className={cn('inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium', (
                        isCurrentItem
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      ))}
                      aria-current={isCurrentItem ? 'page' : undefined}
                    >
                      {item.name}
                    </a>
                  );
                })}
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {/* Profile dropdown */}
                <Menu as="div" className="ml-3 relative">
                  {({ open }) => (
                    <>
                      <div>
                        <Menu.Button className="bg-white flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          <span className="sr-only">Open user menu</span>
                          <img
                            src={authUser.displayPhotoUrl}
                            alt={`${authUser.firstName}'s profile picture`}
                            className="h-8 w-8 rounded-full"
                          />
                        </Menu.Button>
                      </div>
                      <Transition
                        show={open}
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items
                          static
                          className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                        >
                          {USER_NAVIGATION.map((item) => (
                            <Menu.Item key={item.name}>
                              {({ active }) => (
                                <a
                                  href={item.href}
                                  className={cn('block px-4 py-2 text-sm text-gray-700', {
                                    'bg-gray-100': active,
                                  })}
                                >
                                  {item.name}
                                </a>
                              )}
                            </Menu.Item>
                          ))}
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                type="button"
                                onClick={logout}
                                className={cn('block w-full text-left px-4 py-2 text-sm text-gray-700', {
                                  'bg-gray-100': active,
                                })}
                              >
                                Sign Out
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </>
                  )}
                </Menu>
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
              {NAVIGATION.map((item) => {
                const isCurrentItem = location.pathname === item.href;

                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={cn('block pl-3 pr-4 py-2 border-l-4 text-base font-medium', (
                      isCurrentItem
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                    ))}
                    aria-current={isCurrentItem ? 'page' : undefined}
                  >
                    {item.name}
                  </a>
                );
              })}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <img
                    src={authUser.displayPhotoUrl}
                    alt={`${authUser.firstName}'s profile picture`}
                    className="h-10 w-10 rounded-full"
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{authUser.name}</div>
                  <div className="text-sm font-medium text-gray-500">{authUser.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {USER_NAVIGATION.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    {item.name}
                  </a>
                ))}
                <button
                  type="button"
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
