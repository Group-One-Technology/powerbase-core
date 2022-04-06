import React from 'react';
import PropTypes from 'prop-types';
import { PlusIcon } from '@heroicons/react/outline';

import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';
import { GripVerticalIcon } from '@components/ui/icons/GripVerticalIcon';
import { SortableItem } from '@components/ui/SortableItem';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { closestCenter, DndContext } from '@dnd-kit/core';
import { useSensors } from '@lib/hooks/dnd-kit/useSensors';

function FieldItem({ field, fieldTypes }) {
  return (
    <SortableItem
      id={field.id}
      as="li"
      className="flex gap-2 items-center"
      handle={{
        position: 'left',
        component: (
          <button
            type="button"
            className="inline-flex items-center px-1 py-2 border border-transparent text-xs font-medium rounded cursor-grabbing text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <span className="sr-only">Reorder</span>
            <GripVerticalIcon className="h-3 w-3 text-gray-500" />
          </button>
        ),
      }}
    >
      <div className="relative py-1 flex-1 flex items-center">
        <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
          <FieldTypeIcon isPrimaryKey={field.isPrimaryKey} typeId={field.fieldTypeId} fieldTypes={fieldTypes} />
        </div>
        <span className="pl-6 text-sm">{field.alias || field.name}</span>
      </div>
    </SortableItem>
  );
}

FieldItem.propTypes = {
  field: PropTypes.object.isRequired,
  fieldTypes: PropTypes.array.isRequired,
};

export function CreateTableFields({ fields, setFields }) {
  const sensors = useSensors();

  const handleReorderFields = async ({ active, over }) => {
    if (active.id !== over.id) {
      const oldIndex = fields.findIndex((item) => item.id === active.id);
      const newIndex = fields.findIndex((item) => item.id === over.id);
      const updatedFields = arrayMove(fields, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index,
      }));

      setFields(updatedFields);
    }
  };

  return (
    <div className="my-4 mx-2">
      <h3 className="block text-sm font-medium text-gray-700 mb-2">Fields</h3>
      <div className="flex flex-col gap-1">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleReorderFields}>
          <SortableContext items={fields} strategy={verticalListSortingStrategy}>
            <ul className="list-none flex flex-col">
              {fields.map((field) => (
                <FieldItem
                  key={field.id}
                  field={field}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
        <button
          type="button"
          className="inline-flex items-center p-2 text-xs text-gray-600 rounded-lg hover:bg-gray-200 focus:bg-gray-200"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add a field
        </button>
      </div>
    </div>
  );
}

CreateTableFields.propTypes = {
  fields: PropTypes.array.isRequired,
  setFields: PropTypes.func.isRequired,
};
