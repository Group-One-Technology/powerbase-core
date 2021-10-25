import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useFieldTypes } from '@models/FieldTypes';
import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';
import {
  EyeOffIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from '@heroicons/react/outline';

import { useViewFields } from '@models/ViewFields';
import { useSaveStatus } from '@models/SaveStatus';
import { useViewFieldState } from '@models/view/ViewFieldState';
import { hideViewField } from '@lib/api/view-fields';
import { updateFieldAlias, setFieldAsPII, unsetFieldAsPII } from '@lib/api/fields';

export function GridHeaderOptions({ option, field, setOptionOpen }) {
  const { saving, catchError, saved } = useSaveStatus();
  const { data: fields, mutate: mutateViewFields } = useViewFields();
  const { setFields } = useViewFieldState();
  const { data: fieldTypes } = useFieldTypes();
  const fieldType = fieldTypes.find((item) => item.id === field.fieldTypeId);

  const [alias, setAlias] = useState(field.alias || field.name);

  useEffect(() => {
    setAlias(field.alias || field.name);
  }, [field]);

  const handleOpenChange = async (value) => {
    if (!value && alias !== field.alias) {
      saving();
      const updatedFields = fields.map((item) => ({
        ...item,
        alias: item.id === field.id
          ? alias
          : item.alias,
      }));

      setFields(updatedFields);
      setOptionOpen(value);

      try {
        await updateFieldAlias({ id: field.fieldId, alias });
        await mutateViewFields(updatedFields);
        saved();
      } catch (err) {
        catchError(err);
      }
    } else {
      setOptionOpen(value);
    }
  };

  const handleAliasChange = (evt) => {
    setAlias(evt.target.value);
  };

  const handleHideField = async () => {
    saving();

    const updatedFields = fields.map((item) => ({
      ...item,
      isHidden: item.id === field.id
        ? true
        : item.isHidden,
    }));

    setFields(updatedFields);
    setOptionOpen(false);

    try {
      await hideViewField({ id: field.id });
      await mutateViewFields(updatedFields);
      saved();
    } catch (err) {
      catchError(err);
    }
  };

  const handleTogglePII = async () => {
    saving();

    const updatedFields = fields.map((item) => ({
      ...item,
      isPII: item.id === field.id
        ? !field.isPii
        : item.isPii,
    }));

    setFields(updatedFields);
    setOptionOpen(false);

    try {
      if (!field.isPii) {
        await setFieldAsPII({ id: field.fieldId });
      } else {
        await unsetFieldAsPII({ id: field.fieldId });
      }

      await mutateViewFields(updatedFields);
      saved();
    } catch (err) {
      catchError(err);
    }
  };

  return (
    <DropdownMenu.Root open={option.open} onOpenChange={handleOpenChange}>
      <DropdownMenu.Trigger />
      <DropdownMenu.Content side="bottom" sideOffset={10} align="start" alignOffset={-10}>
        <div className="block overflow-hidden rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 w-60">
          <div className="py-2">
            <div className="px-4 w-auto">
              <input
                type="text"
                aria-label="Field Name"
                value={alias}
                onChange={handleAliasChange}
                placeholder="Field Name"
                className="my-2 appearance-none block w-full p-1 text-sm text-gray-900 border rounded-md shadow-sm placeholder-gray-400 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <DropdownMenu.Label className="mt-2 mb-1 px-4 text-xs uppercase text-gray-500">
              Field Name
            </DropdownMenu.Label>
            <DropdownMenu.Item className="my-1 px-4 text-sm flex items-center text-gray-900">
              {field.name}
            </DropdownMenu.Item>
            <DropdownMenu.Label className="mt-2 mb-1 px-4 text-xs uppercase text-gray-500">
              Field Type
            </DropdownMenu.Label>
            <DropdownMenu.Item className="my-1 px-4 text-sm flex items-center text-gray-900">
              <FieldTypeIcon fieldType={fieldType} className="mr-1.5" />
              {fieldType.name}
            </DropdownMenu.Item>
            {field.isPrimaryKey && (
              <DropdownMenu.Item className="my-1 px-4 text-sm flex items-center text-gray-900">
                <FieldTypeIcon className="mr-1.5" isPrimaryKey />
                Primary Key
              </DropdownMenu.Item>
            )}
            {field.isForeignKey && (
              <DropdownMenu.Item className="my-1 px-4 text-sm flex items-center text-gray-900">
                <FieldTypeIcon className="mr-1.5" isForeignKey />
                Foreign Key
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Separator className="my-2 h-0.5 bg-gray-100" />
            <DropdownMenu.Item
              className="px-4 py-1 text-sm cursor-not-allowed flex items-center hover:bg-gray-100 focus:bg-gray-100 "
            >
              <ArrowRightIcon className="h-4 w-4 mr-1.5" />
              Insert right
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="px-4 py-1 text-sm cursor-not-allowed flex items-center hover:bg-gray-100 focus:bg-gray-100 "
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1.5" />
              Insert left
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="px-4 py-1 text-sm cursor-pointer flex items-center hover:bg-gray-100 focus:bg-gray-100"
              onSelect={handleHideField}
            >
              <EyeOffIcon className="h-4 w-4 mr-1.5" />
              Hide
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="px-4 py-1 text-sm cursor-pointer flex items-center hover:bg-gray-100 focus:bg-gray-100"
              onSelect={handleTogglePII}
            >
              <ShieldCheckIcon className="h-4 w-4 mr-1.5" />
              {!field.isPii ? 'Set as PII' : 'Unset as PII'}
            </DropdownMenu.Item>
          </div>
        </div>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

GridHeaderOptions.propTypes = {
  option: PropTypes.object.isRequired,
  field: PropTypes.object.isRequired,
  setOptionOpen: PropTypes.func.isRequired,
};
