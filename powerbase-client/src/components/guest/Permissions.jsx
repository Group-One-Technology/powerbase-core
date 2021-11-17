import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { Listbox, Switch } from '@headlessui/react';
import { SelectorIcon } from '@heroicons/react/outline';

import { useBaseUser } from '@models/BaseUser';
import { CUSTOM_PERMISSIONS } from '@lib/constants/permissions';
import { Button } from '@components/ui/Button';

export function Permissions({
  guest,
  tables,
  fields,
  table,
  setTable,
  permissions,
  togglePermissions,
  canToggleAccess,
  updatePermissions,
  loading,
}) {
  const { baseUser } = useBaseUser();
  const [field, setField] = useState();

  useEffect(() => {
    if (table && fields?.length) {
      setField(fields[0]);
    }
  }, [fields, table]);

  if (!table || !field) {
    return null;
  }

  return (
    <form onSubmit={updatePermissions} className="mt-2">
      <ul className="my-1">
        {baseUser && CUSTOM_PERMISSIONS.Base.map((item) => {
          if (item.hidden) return null;

          if (baseUser.access === 'custom') {
            if (baseUser.permissions[item.key] == null && !item.value) return null;
            if (!baseUser.permissions[item.key]) return null;
          }

          const checked = permissions.base[item.key];

          return (
            <li key={item.key} className="my-2">
              <label className="flex w-full">
                <div>
                  <div className="font-medium text-sm capitalize">
                    {item.name}
                  </div>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
                <Switch
                  checked={checked}
                  onChange={() => togglePermissions.base(item)}
                  className={cn(
                    'ml-auto relative inline-flex flex-shrink-0 h-4 w-7 border-2 border-transparent rounded-full transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
                    checked ? 'bg-indigo-600' : 'bg-gray-200',
                    !canToggleAccess ? 'cursor-not-allowed' : 'cursor-pointer',
                  )}
                  disabled={!canToggleAccess}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'pointer-events-none inline-block h-3 w-3 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
                      checked ? 'translate-x-3' : 'translate-x-0',
                    )}
                  />
                </Switch>
              </label>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center gap-1 my-2">
        <h4 className="flex-1 text-base font-medium text-gray-900">Table</h4>
        <Listbox value={table} onChange={setTable} disabled={!canToggleAccess}>
          <div className="flex-1 relative">
            <Listbox.Button
              className="block relative w-full text-sm capitalize h-8 px-2 py-1 text-left border border-gray-300 bg-white rounded-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 sm:text-sm"
              disabled={!canToggleAccess}
            >
              <span className="block truncate">{table.alias || table.name}</span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <SelectorIcon
                  className="w-5 h-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 mt-1 w-full text-left bg-white shadow-lg max-h-60 rounded-md py-1 text-sm ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {tables.map((option) => (
                <Listbox.Option
                  key={option.id}
                  value={option}
                  className={({ active, selected }) => cn(
                    'cursor-default select-none relative py-1.5 pl-2 pr-6 text-gray-900',
                    (active || selected) ? 'bg-gray-100' : 'bg-white',
                  )}
                >
                  {option.alias || option.name}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>

      <ul className="my-1">
        {baseUser && CUSTOM_PERMISSIONS.Table.map((item) => {
          if (item.hidden) return null;

          if (baseUser.access === 'custom') {
            if (baseUser.permissions.tables[table.id]) {
              if (baseUser.permissions.tables[table.id][item.key] == null) {
                if (!item.value) return null;
              } else if (!baseUser.permissions.tables[table.id][item.key]) {
                return null;
              }
            } else if (!item.value) {
              return null;
            }
          }

          const checked = permissions.tables[table.id]
            ? permissions.tables[table.id][item.key] ?? item.value
            : item.value;

          return (
            <li key={item.key} className="my-2">
              <label className="flex w-full">
                <div>
                  <div className="font-medium text-sm capitalize">
                    {item.name}
                  </div>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
                <Switch
                  checked={checked}
                  onChange={() => togglePermissions.table(item)}
                  className={cn(
                    'ml-auto relative inline-flex flex-shrink-0 h-4 w-7 border-2 border-transparent rounded-full transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
                    checked ? 'bg-indigo-600' : 'bg-gray-200',
                    (!canToggleAccess) ? 'cursor-not-allowed' : 'cursor-pointer',
                  )}
                  disabled={!canToggleAccess}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'pointer-events-none inline-block h-3 w-3 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
                      checked ? 'translate-x-3' : 'translate-x-0',
                    )}
                  />
                </Switch>
              </label>
            </li>
          );
        })}
      </ul>

      <div className="my-2 py-1 px-4 border border-gray-300 rounded">
        <div className="flex items-center gap-1 my-2">
          <h5 className="flex-1 text-base font-medium text-gray-900">Field</h5>
          <Listbox value={field} onChange={setField} disabled={!canToggleAccess}>
            <div className="flex-1 relative">
              <Listbox.Button
                className="block relative w-full text-sm capitalize h-8 px-2 py-1 text-left border border-gray-300 bg-white rounded-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 sm:text-sm"
                disabled={!canToggleAccess}
              >
                <span className="block truncate">{field.alias || field.name}</span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <SelectorIcon
                    className="w-5 h-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>
              <Listbox.Options className="absolute z-10 mt-1 w-full text-left bg-white shadow-lg max-h-60 rounded-md py-1 text-sm ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {fields?.map((option) => (
                  <Listbox.Option
                    key={option.id}
                    value={option}
                    className={({ active, selected }) => cn(
                      'cursor-default select-none relative py-1.5 pl-2 pr-6 text-gray-900',
                      (active || selected) ? 'bg-gray-100' : 'bg-white',
                    )}
                  >
                    {option.alias || option.name}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>
        </div>

        <ul className="my-1">
          {baseUser && CUSTOM_PERMISSIONS.Field.map((item) => {
            if (item.hidden) return null;

            if (baseUser.access === 'custom') {
              if (baseUser.permissions.fields?.[field.id]) {
                if (baseUser.permissions.fields[field.id][item.key] == null) {
                  if (!item.value) return null;
                } else if (!baseUser.permissions.fields[field.id][item.key]) {
                  return null;
                }
              } else if (!item.value) {
                return null;
              }
            }

            const checked = permissions.fields?.[field.id]
              ? permissions.fields[field.id][item.key] ?? item.value
              : item.value;

            return (
              <li key={item.key} className="my-2">
                <label className="flex w-full">
                  <div>
                    <div className="font-medium text-sm capitalize">
                      {item.name}
                    </div>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                  <Switch
                    checked={checked}
                    onChange={() => togglePermissions.field(field, item)}
                    className={cn(
                      'ml-auto relative inline-flex flex-shrink-0 h-4 w-7 border-2 border-transparent rounded-full transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
                      checked ? 'bg-indigo-600' : 'bg-gray-200',
                      (loading || !canToggleAccess) ? 'cursor-not-allowed' : 'cursor-pointer',
                    )}
                    disabled={loading || !canToggleAccess}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'pointer-events-none inline-block h-3 w-3 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
                        checked ? 'translate-x-3' : 'translate-x-0',
                      )}
                    />
                  </Switch>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      {(guest && canToggleAccess) && (
        <div className="mt-5 sm:mt-6">
          <Button
            type="submit"
            className="flex items-center justify-center ml-auto rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            loading={loading}
          >
            Update Permissions
          </Button>
        </div>
      )}
    </form>
  );
}

Permissions.propTypes = {
  guest: PropTypes.object,
  tables: PropTypes.array.isRequired,
  fields: PropTypes.array,
  table: PropTypes.object,
  setTable: PropTypes.func.isRequired,
  permissions: PropTypes.object,
  togglePermissions: PropTypes.object.isRequired,
  canToggleAccess: PropTypes.bool,
  updatePermissions: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
