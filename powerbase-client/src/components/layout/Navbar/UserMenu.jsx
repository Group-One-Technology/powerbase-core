import React, { Fragment } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/solid';
import { Menu, Transition } from '@headlessui/react';
import Gravatar from 'react-gravatar';
import cn from 'classnames';
import PropTypes from 'prop-types';

import { useAuthUser } from '@models/AuthUser';
import { logout } from '@lib/api/auth';

const USER_NAVIGATION = [
  { name: 'Profile', href: '/profile' },
  { name: 'Settings', href: '/settings' },
];

export function UserMenu({ list, colored }) {
  const history = useHistory();
  const { authUser, mutate } = useAuthUser();

  const handleLogout = async () => {
    try {
      await logout();
      mutate(null);
      history.push('/login');
    } catch (error) {
      console.error(error);
    }
  };

  if (list) {
    return (
      <>
        {USER_NAVIGATION.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'block px-4 py-2 text-base font-medium',
              colored ? 'text-white hover:bg-gray-100 hover:bg-opacity-30' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100',
            )}
          >
            {item.name}
          </Link>
        ))}
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            'block w-full text-left px-4 py-2 text-base font-medium',
            colored ? 'text-white hover:bg-gray-100 hover:bg-opacity-30' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100',
          )}
        >
          Sign Out
        </button>
      </>
    );
  }

  return (
    <Menu as="div" className="ml-3 relative z-10">
      {({ open }) => (
        <>
          <Menu.Button
            className={cn(
              'bg-transparent flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-current',
              !colored && 'focus:ring-offset-2',
            )}
          >
            <Gravatar
              email={authUser.email}
              className="h-6 w-6 rounded-full"
              alt={`${authUser.firstName}'s profile picture`}
            />
            <span className="text-sm font-normal ml-1">{authUser.firstName}</span>
            <span className="sr-only">Open user menu</span>
            <ChevronDownIcon className="h-4 w-4 mt-0.5 ml-1" />
          </Menu.Button>
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
                    <Link
                      to={item.href}
                      className={cn('block px-4 py-2 text-sm text-gray-700', {
                        'bg-gray-100': active,
                      })}
                    >
                      {item.name}
                    </Link>
                  )}
                </Menu.Item>
              ))}
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    onClick={handleLogout}
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
  );
}

UserMenu.propTypes = {
  list: PropTypes.bool,
  colored: PropTypes.bool,
};
