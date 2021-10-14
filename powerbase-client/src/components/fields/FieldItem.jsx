import React, { useState } from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { Switch } from '@headlessui/react';

import { useFieldTypes } from '@models/FieldTypes';
import { useViewFields } from '@models/ViewFields';
import { hideViewField, unhideViewField } from '@lib/api/view-fields';
import { SortableItem } from '@components/ui/SortableItem';
import { GripVerticalIcon } from '@components/ui/icons/GripVerticalIcon';
import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';

export function FieldItem({ field }) {
  const { data: fields, mutate: mutateViewFields } = useViewFields();
  const { data: fieldTypes } = useFieldTypes();
  const [loading, setLoading] = useState(false);

  const handleToggleVisibility = async () => {
    setLoading(true);

    try {
      if (!field.isHidden) {
        await hideViewField({ id: field.id });
      } else {
        await unhideViewField({ id: field.id });
      }

      const updatedFields = fields.map((item) => ({
        ...item,
        isHidden: item.id === field.id
          ? !field.isHidden
          : item.isHidden,
      }));

      mutateViewFields(updatedFields);
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  return (
    <SortableItem
      id={field.id}
      as="li"
      className="sort flex gap-2 items-center"
      handle={{
        position: 'left',
        component: (
          <button
            type="button"
            className="inline-flex items-center px-1 py-2 border border-transparent text-xs font-medium rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 cursor-grabbing"
          >
            <span className="sr-only">Reorder</span>
            <GripVerticalIcon className="h-3 w-3 text-gray-500" />
          </button>
        ),
      }}
    >
      <div className="relative flex-1 flex items-center">
        <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
          <FieldTypeIcon typeId={field.fieldTypeId} fieldTypes={fieldTypes} />
        </div>
        <span className="pl-6">{field.name}</span>
      </div>
      <div className="block">
        <Switch
          checked={!field.isHidden}
          onChange={handleToggleVisibility}
          className={cn(
            'relative inline-flex flex-shrink-0 h-4 w-7 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
            !field.isHidden ? 'bg-indigo-600' : 'bg-gray-200',
          )}
          disabled={loading}
        >
          <span className="sr-only">Show Field</span>
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none inline-block h-3 w-3 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
              !field.isHidden ? 'translate-x-3' : 'translate-x-0',
            )}
          />
        </Switch>
      </div>
    </SortableItem>
  );
}

FieldItem.propTypes = {
  field: PropTypes.object.isRequired,
};
