import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import cn from 'classnames';

export function Tabs({ id, name, label, tabs }) {
  const location = useLocation();

  return (
    <div className="mt-2 mb-6">
      <div className="sm:hidden">
        <label htmlFor={id} className="sr-only">
          {label || 'Select a tab'}
        </label>
        <select
          id={id}
          name={name}
          className="block w-full focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
          defaultValue={tabs.find((tab) => location.pathname === tab.href).name}
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <nav className="flex space-x-4 justify-center" aria-label="Tabs">
          {tabs.map((tab) => {
            const isCurrentTab = location.pathname === tab.href;

            return (
              <Link
                key={tab.name}
                to={isCurrentTab ? '#' : tab.href}
                className={cn('px-6 py-2 font-medium text-sm rounded-md', (
                  isCurrentTab ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                ))}
                aria-current={isCurrentTab ? 'page' : undefined}
              >
                {tab.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

Tabs.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  tabs: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
  })).isRequired,
};
