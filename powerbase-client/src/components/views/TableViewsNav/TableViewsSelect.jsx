import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { ViewGridIcon } from '@heroicons/react/outline';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { IViewField } from '@lib/propTypes/view_field';

export function TableViewsSelect({ tableId, currentGrid, grids }) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      {({ open }) => (
        <>
          <div>
            <Menu.Button className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
              <ViewGridIcon className="inline h-4 w-4 mr-1" />
              {currentGrid.name}
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
                {grids.map((grid) => (
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/base/create"
                        className={cn('block px-4 py-2 text-sm', (
                          active
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700'
                        ))}
                      >
                        {grid.name} View
                      </Link>
                    )}
                  </Menu.Item>
                ))}
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to={`table/${tableId}/view/create`}
                      className={cn('block px-4 py-2 text-sm', (
                        active
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-700'
                      ))}
                    >
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
  tableId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  currentGrid: IViewField.isRequired,
  grids: PropTypes.arrayOf(IViewField).isRequired,
};
