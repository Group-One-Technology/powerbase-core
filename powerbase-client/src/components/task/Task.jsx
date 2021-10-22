import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { useBase } from '@models/Base';

export function Task() {
  const { data: base } = useBase();
  const tasks = base.tasks

  return (
    <Popover.Root>
      <Popover.Trigger>
        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-orange-100 bg-orange-600 rounded-full">{tasks.length}</span>
      </Popover.Trigger>
      <Popover.Anchor />
      <Popover.Content>
        <fieldset className="bg-white p-5 rounded-md shadow">
          <div className="font-medium text-gray-900">Pending Tasks</div>
          <div className="mt-4 border-t border-b border-gray-200 divide-y divide-gray-200">
            {
              tasks.map(task => 
                <div className="relative flex items-start py-4">
                  <div className="min-w-0 flex-1 text-sm">
                    <label for="person-1" className="font-medium text-gray-700 select-none">{task.name}</label>
                  </div>
                  <div className="ml-3 flex items-center h-5 text-green-600 cursor-pointer">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>
                  </div>
                </div>
              )
            }
          </div>
        </fieldset>
 
        <Popover.Close />
        <Popover.Arrow />
      </Popover.Content>
    </Popover.Root>
  );
}