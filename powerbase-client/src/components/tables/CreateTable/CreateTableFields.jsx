import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  PencilAltIcon,
  PlusIcon,
  SparklesIcon,
  XIcon,
} from '@heroicons/react/outline';
import { closestCenter, DndContext } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSensors } from '@lib/hooks/dnd-kit/useSensors';

import { useFieldTypes } from '@models/FieldTypes';
import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';
import { GripVerticalIcon } from '@components/ui/icons/GripVerticalIcon';
import { SortableItem } from '@components/ui/SortableItem';
import { CreateTableAddField } from './CreateTableAddField';

function FieldItem({
  field,
  fieldTypes,
  update,
  remove,
  setAsPrimaryKey,
  unsetAsPrimaryKey,
}) {
  const fieldType = fieldTypes.find((item) => item.id === field.fieldTypeId);

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
          <FieldTypeIcon isPrimaryKey={field.isPrimaryKey} fieldType={fieldType} />
        </div>
        <span className="pl-6 text-sm">{field.alias || field.name}</span>
        <span className="pl-6 text-xs">
          ({fieldType.name})
        </span>
      </div>
      {field.isVirtual && (
        <SparklesIcon
          className="h-5 w-5 ml-auto cursor-auto select-none text-indigo-500"
        />
      )}
      <div className="ml-auto flex gap-0.5">
        {((unsetAsPrimaryKey || setAsPrimaryKey) && !field.isVirtual) && (
          <button
            type="button"
            className="p-2 inline-block rounded bg-gray-100 text-gray-700 text-sm capitalize hover:text-indigo-600 hover:bg-indigo-200 focus:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:gray-500"
            onClick={field.isPrimaryKey ? unsetAsPrimaryKey : setAsPrimaryKey}
          >
            {field.isPrimaryKey
              ? 'Unset as Primary Key'
              : 'Set as Primary Key'}
          </button>
        )}
        {update && (
          <button
            type="button"
            className="p-2 inline-block rounded bg-gray-100 text-gray-700 text-sm capitalize hover:text-indigo-600 hover:bg-indigo-200 focus:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:gray-500"
            onClick={update}
          >
            <PencilAltIcon className="h-4 w-4" />
            <span className="sr-only">Edit Field</span>
          </button>
        )}
        {remove && (
          <button
            type="button"
            className="p-2 inline-block rounded bg-gray-100 text-gray-700 text-sm capitalize hover:text-red-600 hover:bg-red-200 focus:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:gray-500"
            onClick={remove}
          >
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Remove Field</span>
          </button>
        )}
      </div>
    </SortableItem>
  );
}

FieldItem.propTypes = {
  field: PropTypes.object.isRequired,
  fieldTypes: PropTypes.array.isRequired,
  remove: PropTypes.func,
  update: PropTypes.func,
  setAsPrimaryKey: PropTypes.func,
  unsetAsPrimaryKey: PropTypes.func,
};

export function CreateTableFields({
  tableName,
  isVirtual,
  fields,
  setFields,
}) {
  const { data: fieldTypes } = useFieldTypes();
  const primaryKeys = fields.filter((item) => item.isPrimaryKey);

  const [count, setCount] = useState(1);
  const [addFieldModalOpen, setAddFieldModalOpen] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState(null);

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

  const togglePrimaryKey = (id, value) => {
    setFields(fields.map((item) => ({
      ...item,
      isPrimaryKey: item.id === id
        ? value ?? !item.isPrimaryKey
        : item.isPrimaryKey,
    })));
  };

  const handleRemoveField = (id) => {
    setFields(fields.filter((item) => item.id !== id));
  };

  const handleUpdateField = (id) => {
    setSelectedFieldId(id);
    setAddFieldModalOpen(true);
  };

  const handleAddField = () => {
    setSelectedFieldId(null);
    setAddFieldModalOpen(true);
  };

  const handleSubmitUpdateField = (payload) => {
    setFields(fields.map((item) => (item.id === payload.id
      ? { ...item, ...payload }
      : item)));
    setAddFieldModalOpen(false);
  };

  const handleSubmitField = (payload) => {
    setFields([...fields, { id: count, ...payload }]);
    setCount((val) => val + 1);
    setAddFieldModalOpen(false);
  };

  return (
    <>
      <div className="my-4">
        <h3 className="block text-sm font-medium text-gray-700 mb-2">
          Fields
        </h3>
        <div className="flex flex-col gap-1">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleReorderFields}>
            <SortableContext items={fields} strategy={verticalListSortingStrategy}>
              <ul className="list-none flex flex-col">
                {fields.map((field) => (
                  <FieldItem
                    key={field.id}
                    field={field}
                    fieldTypes={fieldTypes}
                    update={() => handleUpdateField(field.id)}
                    remove={() => handleRemoveField(field.id)}
                    setAsPrimaryKey={field.isPrimaryKey
                      ? null
                      : () => togglePrimaryKey(field.id, true)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
          <button
            type="button"
            className="inline-flex items-center p-2 text-xs text-gray-600 rounded-lg hover:bg-gray-200 focus:bg-gray-200"
            onClick={handleAddField}
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add a field
          </button>
        </div>

        <CreateTableAddField
          table={{
            name: tableName,
            hasPrimaryKey: primaryKeys?.length > 0,
            isVirtual,
          }}
          fieldId={selectedFieldId}
          fields={fields}
          open={addFieldModalOpen}
          setOpen={setAddFieldModalOpen}
          update={handleSubmitUpdateField}
          submit={handleSubmitField}
        />
      </div>

      <div className="my-4">
        <h3 className="block text-sm font-medium text-gray-700 mb-2">
          Primary Keys
        </h3>
        <ul className="list-none flex flex-col">
          {primaryKeys.map((field) => (
            <FieldItem
              key={field.id}
              field={field}
              fieldTypes={fieldTypes}
              unsetAsPrimaryKey={() => togglePrimaryKey(field.id, false)}
            />
          ))}
          {primaryKeys.length === 0 && (
            <p className="text-xs text-center text-gray-700">
              There must be at least one primary key in a table.
            </p>
          )}
        </ul>
      </div>
    </>
  );
}

CreateTableFields.propTypes = {
  tableName: PropTypes.string,
  isVirtual: PropTypes.bool,
  fields: PropTypes.array.isRequired,
  setFields: PropTypes.func.isRequired,
};
