import React, { Fragment } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { MenuIcon, XIcon } from '@heroicons/react/outline';
import cn from 'classnames';
import PropTypes from 'prop-types';

import { useAuthUser } from '@models/AuthUser';
import { IBase } from '@lib/propTypes/base';
import { BG_COLORS } from '@lib/constants';

import { Logo } from '@components/ui/Logo';
import { UserMenu } from './UserMenu';
import { BaseMenu } from './BaseMenu';
import { MobileNav } from './MobileNav';
import { SavingIndicator } from './SavingIndicator';

export const NAVIGATION = [
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
            <div className="flex sm:grid sm:grid-cols-4 justify-between items-center h-11">
              <div className="col-span-1">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/">
                    <Logo white={!!base} className="block h-5 w-auto" />
                  </Link>
                  <SavingIndicator />
                </div>
              </div>
              <div className={cn('hidden sm:col-span-2 sm:justify-center sm:-my-px sm:flex sm:space-x-8', { 'h-full': !base })}>
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
          <MobileNav base={base} bases={otherBases} navigation={NAVIGATION} />
        </>
      )}
    </Disclosure>
  );
}

Navbar.propTypes = {
  base: IBase,
  bases: PropTypes.arrayOf(IBase),
};
