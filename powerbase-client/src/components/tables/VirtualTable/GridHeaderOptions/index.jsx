import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useFieldTypes } from '@models/FieldTypes';
import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';
import {
  EyeOffIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  LockClosedIcon,
} from '@heroicons/react/outline';

import { useViewFields } from '@models/ViewFields';
import { useSaveStatus } from '@models/SaveStatus';
import { useViewFieldState } from '@models/view/ViewFieldState';
import { useBaseUser } from '@models/BaseUser';
import { useFieldPermissionsModal } from '@models/modals/FieldPermissionsModal';
import { hideViewField } from '@lib/api/view-fields';
import { FieldType } from '@lib/constants/field-types';
import {
  updateFieldAlias,
  updateFieldType,
  setFieldAsPII,
  unsetFieldAsPII,
} from '@lib/api/fields';
import { FormatCurrencyOption } from './FormatCurrencyOption';

export function GridHeaderOptions({
  table,
  option,
  field,
  setOptionOpen,
}) {
  const { saving, catchError, saved } = useSaveStatus();
  const { baseUser } = useBaseUser();
  const { data: fields, mutate: mutateViewFields } = useViewFields();
  const { setFields } = useViewFieldState();
  const { data: fieldTypes } = useFieldTypes();
  const { modal: permissionsModal } = useFieldPermissionsModal();

  const fieldType = fieldTypes.find((item) => item.id === field.fieldTypeId);
  const relatedFieldTypes = fieldTypes.filter((item) => item.dataType === fieldType.dataType);
  const isFieldTypeConvertable = relatedFieldTypes.length > 1 && !field.dbType.includes('uuid') && !field.dbType.includes('int');
  const canManageViews = baseUser?.can('manageViews', table.id);
  const canAddFields = baseUser?.can('addFields', field.id);
  const canManageField = baseUser?.can('manageField', field.id);

  const [alias, setAlias] = useState(field.alias || field.name);

  useEffect(() => {
    setAlias(field.alias || field.name);
  }, [field]);

  const handleOpenChange = async (value) => {
    if (!value && alias !== field.alias && canManageField) {
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
        catchError(err.response.data.error || err.response.data.exception);
      }
    } else {
      setOptionOpen(value);
    }
  };

  const handleAliasChange = (evt) => {
    setAlias(evt.target.value);
  };

  const handleFieldTypeChange = async (selectedFieldType) => {
    if (canManageField) {
      saving();

      const updatedFields = fields.map((item) => ({
        ...item,
        fieldTypeId: item.id === field.id
          ? selectedFieldType.id
          : item.fieldTypeId,
      }));

      setFields(updatedFields);
      setOptionOpen(false);

      try {
        await updateFieldType({ id: field.fieldId, fieldTypeId: selectedFieldType.id });
        await mutateViewFields(updatedFields);
        saved();
      } catch (err) {
        catchError(err.response.data.error || err.response.data.exception);
      }
    }
  };

  const handlePermissions = () => {
    if (canManageField) {
      permissionsModal.open(field);
    }
  };

  const handleHideField = async () => {
    if (canManageViews) {
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
        catchError(err.response.data.error || err.response.data.exception);
      }
    }
  };

  const handleTogglePII = async () => {
    if (canManageField) {
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
        catchError(err.response.data.error || err.response.data.exception);
      }
    }
  };

  return (
    <DropdownMenu.Root open={option.open} onOpenChange={handleOpenChange}>
      <DropdownMenu.Trigger />
      <DropdownMenu.Content side="bottom" sideOffset={10} align="start" alignOffset={-10} className="block overflow-hidden rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 w-60">
        <div className="py-2">
          {canManageField && (
            <div className="px-4 w-auto">
              <input
                type="text"
                aria-label="Field Alias"
                value={alias}
                onChange={handleAliasChange}
                placeholder="Field Alias"
                className="my-2 appearance-none block w-full p-1 text-sm text-gray-900 border rounded-md shadow-sm placeholder-gray-400 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          <dl>
            {!canManageField && (
              <>
                <dt className="mt-2 mb-1 px-4 text-xs uppercase text-gray-500">
                  Field Alias
                </dt>
                <dd className="px-4 py-1 text-sm flex items-center text-gray-900">
                  {field.alias}
                </dd>
              </>
            )}

            <dt className="mt-2 mb-1 px-4 text-xs uppercase text-gray-500">
              Field Name
            </dt>
            <dd className="px-4 py-1 text-sm flex items-center text-gray-900">
              {field.name}
            </dd>

            <dt className="mt-2 mb-1 px-4 text-xs uppercase text-gray-500">
              DB Type
            </dt>
            <dd className="px-4 py-1 text-sm flex items-center text-gray-900">
              {field.dbType}
            </dd>
          </dl>

          <DropdownMenu.Separator className="my-2 h-0.5 bg-gray-100" />

          <DropdownMenu.Label className="mt-2 mb-1 px-4 text-xs uppercase text-gray-500">
            Field Type
          </DropdownMenu.Label>
          {isFieldTypeConvertable && canManageField
            ? (
              <DropdownMenu.Root>
                <DropdownMenu.TriggerItem textValue="\t" className="px-4 py-1 text-sm cursor-pointer flex items-center text-gray-900 hover:bg-gray-100 focus:bg-gray-100">
                  <FieldTypeIcon fieldType={fieldType} className="mr-1.5" />
                  {fieldType.name}
                  <ChevronRightIcon className="ml-auto h-4 w-4" />
                </DropdownMenu.TriggerItem>
                <DropdownMenu.Content sideOffset={-2} className="py-2 block overflow-hidden rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 w-60">
                  {relatedFieldTypes.map((item) => (
                    <DropdownMenu.Item
                      key={item.id}
                      textValue="\t"
                      className={cn(
                        'px-4 py-1 text-sm flex items-center hover:bg-gray-100 focus:bg-gray-100',
                        item.id === field.fieldTypeId ? 'cursor-not-allowed bg-gray-100' : 'cursor-pointer',
                      )}
                      onSelect={() => handleFieldTypeChange(item)}
                      disabled={item.id === field.fieldTypeId}
                    >
                      <FieldTypeIcon className="mr-1.5" fieldType={item} />
                      {item.name}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            ) : (
              <DropdownMenu.Item textValue="\t" className="px-4 py-1 text-sm flex items-center text-gray-900">
                <FieldTypeIcon fieldType={fieldType} className="mr-1.5" />
                {fieldType.name}
              </DropdownMenu.Item>
            )}

          {field.isPrimaryKey && (
            <DropdownMenu.Item textValue="\t" className="px-4 py-1 text-sm flex items-center text-gray-900">
              <FieldTypeIcon className="mr-1.5" isPrimaryKey />
              Primary Key
            </DropdownMenu.Item>
          )}
          {field.isForeignKey && (
            <DropdownMenu.Item textValue="\t" className="px-4 py-1 text-sm flex items-center text-gray-900">
              <FieldTypeIcon className="mr-1.5" isForeignKey />
              Foreign Key
            </DropdownMenu.Item>
          )}

          {canManageViews && <DropdownMenu.Separator className="my-2 h-0.5 bg-gray-100" />}

          {canManageField && (
            <>
              {fieldType.name === FieldType.CURRENCY && <FormatCurrencyOption field={field} />}
              <DropdownMenu.Item
                textValue="\t"
                className="px-4 py-1 text-sm cursor-pointer flex items-center hover:bg-gray-100 focus:bg-gray-100"
                onSelect={handlePermissions}
              >
                <LockClosedIcon className="h-4 w-4 mr-1.5" />
                Permissions
              </DropdownMenu.Item>
            </>
          )}
          {canAddFields && (
            <>
              <DropdownMenu.Item
                textValue="\t"
                className="px-4 py-1 text-sm cursor-not-allowed flex items-center hover:bg-gray-100 focus:bg-gray-100"
              >
                <ArrowRightIcon className="h-4 w-4 mr-1.5" />
                Insert right
              </DropdownMenu.Item>
              <DropdownMenu.Item
                textValue="\t"
                className="px-4 py-1 text-sm cursor-not-allowed flex items-center hover:bg-gray-100 focus:bg-gray-100"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1.5" />
                Insert left
              </DropdownMenu.Item>
            </>
          )}
          {canManageViews && (
            <DropdownMenu.Item
              textValue="\t"
              className="px-4 py-1 text-sm cursor-pointer flex items-center hover:bg-gray-100 focus:bg-gray-100"
              onSelect={handleHideField}
            >
              <EyeOffIcon className="h-4 w-4 mr-1.5" />
              Hide
            </DropdownMenu.Item>
          )}
          {canManageField && (
            <DropdownMenu.Item
              textValue="\t"
              className="px-4 py-1 text-sm cursor-pointer flex items-center hover:bg-gray-100 focus:bg-gray-100"
              onSelect={handleTogglePII}
            >
              <ShieldCheckIcon className="h-4 w-4 mr-1.5" />
              {!field.isPii ? 'Set as PII' : 'Unset as PII'}
            </DropdownMenu.Item>
          )}
        </div>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

GridHeaderOptions.propTypes = {
  table: PropTypes.object.isRequired,
  option: PropTypes.object.isRequired,
  field: PropTypes.object.isRequired,
  setOptionOpen: PropTypes.func.isRequired,
};
