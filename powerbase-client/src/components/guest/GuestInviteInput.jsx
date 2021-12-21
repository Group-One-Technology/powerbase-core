import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { Listbox } from '@headlessui/react';
import { ChevronDownIcon, XIcon } from '@heroicons/react/outline';

import { ACCESS_LEVEL } from '@lib/constants/permissions';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';

function GuestInviteFormWrapper({ submit, children, ...props }) {
  if (submit) {
    return (
      <form onSubmit={submit} {...props}>
        {children}
      </form>
    );
  }

  return <div {...props}>{children}</div>;
}

GuestInviteFormWrapper.propTypes = {
  submit: PropTypes.func,
  children: PropTypes.any.isRequired,
};

export function GuestInviteInput({
  email,
  onEmailChange,
  disabled,
  loading,
  access,
  setAccess,
  submit,
  remove,
  baseUserAccess,
  className,
  ...props
}) {
  return (
    <div className={cn('flex', className)} {...props}>
      <GuestInviteFormWrapper submit={submit} className="relative w-full mt-1 flex rounded-md shadow-sm">
        <input
          type="text"
          value={email}
          onChange={(evt) => onEmailChange(evt.target.value)}
          placeholder="Enter email."
          className={cn(
            'px-3 py-2 block w-full rounded-none rounded-l-md text-sm border-r-0 border-gray-300',
            !disabled ? 'focus:ring-indigo-500 focus:border-indigo-500' : 'cursor-not-allowed bg-gray-300',
          )}
          disabled={disabled}
        />
        <Listbox value={access} onChange={setAccess} disabled={disabled}>
          <Listbox.Button
            type="button"
            className={cn(
              'px-3 py-2 flex items-center border-t border-b border-gray-300 text-gray-500 text-sm capitalize',
              !disabled ? 'hover:bg-gray-100 focus:bg-gray-100' : 'cursor-not-allowed bg-gray-300',
              !submit && 'border-r rounded-r',
            )}
          >
            {access.name}
            <ChevronDownIcon className="h-4 w-4 ml-1" />
          </Listbox.Button>
          <Listbox.Options className="z-10 absolute right-0 top-8 mt-1 w-auto text-left bg-white shadow-lg max-h-60 rounded-md py-1 text-sm ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {ACCESS_LEVEL.map((item) => baseUserAccess.level >= item.level && (
              <Listbox.Option
                key={item.name}
                value={item}
                className={({ active, selected }) => cn(
                  'cursor-default select-none relative py-1.5 pl-2 pr-6 text-gray-900 truncate',
                  (active || selected) ? 'bg-gray-100' : 'bg-white',
                  item.disabled && 'cursor-not-allowed',
                )}
                disabled={item.disabled}
              >
                <div className="font-medium text-sm capitalize">
                  {item.name}
                  {item.disabled && <Badge color="gray" className="ml-2">Coming Soon</Badge>}
                </div>
                <p className="text-xs text-gray-500">{item.description}</p>
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Listbox>
        {submit && (
          <Button
            type="submit"
            className={cn(
              'relative inline-flex items-center justify-center px-4 py-1 border text-sm rounded-r-md text-white',
              !disabled
                ? 'bg-indigo-600 border-indigo-700 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                : 'cursor-not-allowed bg-gray-500 border-gray-900',
            )}
            loading={loading}
          >
            Invite
          </Button>
        )}
      </GuestInviteFormWrapper>
      {remove && (
        <Button
          type="button"
          className={cn(
            'ml-2 mt-1 px-3 py-2 inline-block rounded text-gray-500 text-sm capitalize',
            !disabled
              ? 'hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:gray-500'
              : 'cursor-not-allowed bg-gray-500 border-gray-900',
          )}
          onClick={remove}
        >
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Remove Guest</span>
        </Button>
      )}
    </div>
  );
}

GuestInviteInput.propTypes = {
  email: PropTypes.string.isRequired,
  onEmailChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  access: PropTypes.object.isRequired,
  setAccess: PropTypes.func.isRequired,
  remove: PropTypes.func,
  submit: PropTypes.func,
  className: PropTypes.string,
  baseUserAccess: PropTypes.object.isRequired,
};
