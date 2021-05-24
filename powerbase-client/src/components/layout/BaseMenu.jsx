import React, { Fragment, useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/solid';
import { Menu, Transition } from '@headlessui/react';
import Gravatar from 'react-gravatar';
import cn from 'classnames';
import { Input } from '@components/ui/Input';

export function BaseMenu({ base, otherBases }) {
  const history = useHistory();
  const [name, setName] = useState(base.name);

  return (
    <Menu as="div" className="ml-3 relative">
      {({ open }) => (
        <>
          <div>
            <Menu.Button className="bg-white flex items-center px-2 text-base font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              {base.name}
              <div className="sr-only">Open base settings</div>
              <ChevronDownIcon className="h-4 w-4 mt-0.5 ml-1" />
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
              className="origin-top-right absolute -top-4 left-1/2 -ml-24 mx-auto mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
            >
              <Menu.Item>
                <p className="text-lg font-medium text-center">{base.name}</p>
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to={`/bases/${base.id}/settings`}
                    className={cn('flex justify-between items-center px-4 py-2 text-sm text-gray-700', {
                      'bg-gray-100': active,
                    })}
                  >
                    Settings
                    <ChevronRightIcon className="h-6 w-6" />
                  </Link>
                )}
              </Menu.Item>
              {!!otherBases?.length && (
                <>
                  <Menu.Item>
                    <p className="text-xs px-4 py-2 text-gray-500 uppercase">
                      Other Bases
                    </p>
                  </Menu.Item>
                  {otherBases.map((item, index) => (
                    <Menu.Item key={item.id}>
                      {({ active }) => (
                        <Link
                          to={`/bases/${item.id}`}
                          className={cn('flex justify-between items-center pl-8 pr-4 py-2 text-sm text-gray-700 border-solid border-gray-200', {
                            'border-b': index !== otherBases.length - 1,
                            'bg-gray-100': active,
                          })}
                        >
                          {item.name}
                          <ChevronRightIcon className="h-6 w-6" />
                        </Link>
                      )}
                    </Menu.Item>
                  ))}
                </>
              )}
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    );
  }
