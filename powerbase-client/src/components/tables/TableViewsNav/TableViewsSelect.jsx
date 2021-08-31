import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { ViewGridIcon, PlusIcon } from '@heroicons/react/outline';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { IView } from '@lib/propTypes/view';
import { IId } from '@lib/propTypes/common';

export function TableViewsSelect({
  tableId,
  baseId,
  currentView,
  views,
}) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      {({ open }) => (
        <>
          <div>
            <Menu.Button className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
              <ViewGridIcon className="inline h-4 w-4 mr-1" />
              {currentView.name}
            </Menu.Button>
          </div>

          <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              static
              className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
            >
              <div className="py-1">
                {views.map((grid) => grid.id !== currentView.id && (
                  <Menu.Item key={grid.id}>
                    {({ active }) => (
                      <Link
                        to={`/base/${baseId}/table/${tableId}/?view=${currentView.id}`}
                        className={cn('flex p-2 text-xs items-center', (
                          active
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700'
                        ))}
                      >
                        {grid.name}
                      </Link>
                    )}
                  </Menu.Item>
                ))}
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to={`table/${tableId}/view/create`}
                      className={cn('flex p-2 text-xs items-center', (
                        active
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-700'
                      ))}
                    >
                      <PlusIcon className="h-3 w-3 mr-1 inline-block" />
                      Add View
                    </Link>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
}

TableViewsSelect.propTypes = {
  tableId: IId.isRequired,
  baseId: IId.isRequired,
  currentView: IView.isRequired,
  views: PropTypes.arrayOf(IView).isRequired,
};
