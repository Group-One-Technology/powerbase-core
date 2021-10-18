import React from 'react';
import * as Popover from '@radix-ui/react-popover';

export function Task() {

  return (
    <Popover.Root>
      <Popover.Trigger>
        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-orange-100 bg-orange-600 rounded-full">9</span>
      </Popover.Trigger>
      <Popover.Anchor />
      <Popover.Content>
        <fieldset className="bg-white p-5 rounded-md shadow">
          <div className="font-medium text-gray-900">Pending Migrations</div>
          <div className="mt-4 border-t border-b border-gray-200 divide-y divide-gray-200">
            <div className="relative flex items-start py-4">
              <div className="min-w-0 flex-1 text-sm">
                <label for="person-1" className="font-medium text-gray-700 select-none">Annette Black</label>
              </div>
              <div className="ml-3 flex items-center h-5">
                <input id="person-1" name="person-1" type="checkbox" className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
              </div>
            </div>
          </div>
        </fieldset>
 
        <Popover.Close />
        <Popover.Arrow />
      </Popover.Content>
    </Popover.Root>
  );
}