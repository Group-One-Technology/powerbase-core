import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { EyeOffIcon, ChevronRightIcon, LockClosedIcon } from '@heroicons/react/outline';

import { useSaveStatus } from '@models/SaveStatus';
import { useViewFieldState } from '@models/view/ViewFieldState';
import { useBaseUser } from '@models/BaseUser';
import { useFieldPermissionsModal } from '@models/modals/FieldPermissionsModal';
import { useTableView } from '@models/TableView';
import { useFieldTypes } from '@models/FieldTypes';
import { hideViewField } from '@lib/api/view-fields';
import { FieldType } from '@lib/constants/field-types';
import { updateFieldAlias, updateFieldType } from '@lib/api/fields';
import { captureError } from '@lib/helpers/captureError';
import { PERMISSIONS } from '@lib/constants/permissions';

import { DraggableItem } from '@components/ui/DraggableItem';
import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';
import { ConfirmationModal } from '@components/ui/ConfirmationModal';
import { FieldOptions } from './FieldOptions';
import { FormatCurrencyOption } from './FormatCurrencyOption';
import { FieldMenuDrop } from './FieldMenuDrop';

export function FieldMenu({
  id,
  data,
  table,
  field,
}) {
  const {
    saving, catchError, saved, loading,
  } = useSaveStatus();
  const { baseUser } = useBaseUser();
  const { data: view } = useTableView();
  const { data: fieldTypes } = useFieldTypes();
  const { fields, setFields, mutateViewFields } = useViewFieldState();
  const { modal: permissionsModal } = useFieldPermissionsModal();
  const [confirmModal, setConfirmModal] = useState({ open: false });

  const fieldType = fieldTypes.find((item) => item.id === field.fieldTypeId);
  const relatedFieldTypes = fieldTypes.filter((item) => item.dataType === fieldType.dataType);
  const isFieldTypeConvertable = relatedFieldTypes.length > 1 && !(field.dbType && ['uuid', 'int', 'integer'].includes(field.dbType));

  const canManageView = baseUser?.can(PERMISSIONS.ManageView, view);
  const canManageField = baseUser?.can(PERMISSIONS.ManageField, field);
  const canChangeGuestAccess = baseUser?.can(PERMISSIONS.ChangeGuestAccess);

  const [open, setOpen] = useState(false);
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
      setOpen(value);

      try {
        await updateFieldAlias({ id: field.fieldId, alias });
        await mutateViewFields(updatedFields);
        saved();
      } catch (err) {
        captureError(err);
        catchError(err);
      }
    } else {
      setOpen(value);
    }
  };

  const handleAliasChange = (evt) => {
    setAlias(evt.target.value);
  };

  const handleFieldTypeChange = async (selectedFieldType) => {
    if (canManageField) {
      saving();

      const oldFields = [...fields];
      const updatedFields = fields.map((item) => ({
        ...item,
        fieldTypeId: item.id === field.id
          ? selectedFieldType.id
          : item.fieldTypeId,
      }));

      setFields(updatedFields);
      setOpen(false);

      try {
        await updateFieldType({ id: field.fieldId, fieldTypeId: selectedFieldType.id });
        await mutateViewFields(updatedFields);
        saved();
      } catch (err) {
        setFields(oldFields);
        captureError(err);
        catchError(err);
      }
    }
  };

  const handlePermissions = () => {
    if (canChangeGuestAccess) {
      permissionsModal.open(field);
    }
  };

  const handleHideField = async () => {
    if (canManageView) {
      saving();

      const updatedFields = fields.map((item) => ({
        ...item,
        isHidden: item.id === field.id
          ? true
          : item.isHidden,
      }));

      setFields(updatedFields);
      setOpen(false);

      try {
        await hideViewField({ id: field.id });
        await mutateViewFields(updatedFields);
        saved();
      } catch (err) {
        captureError(err);
        catchError(err);
      }
    }
  };

  return (
    <>
      <ContextMenu.Root open={open} onOpenChange={handleOpenChange}>
        <DraggableItem
          id={id}
          data={data}
          className="absolute w-full h-full"
          Component={ContextMenu.Trigger}
        />
        <ContextMenu.Content side="bottom" sideOffset={10} align="start" alignOffset={-10} className="block overflow-hidden rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 w-60">
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

              {(field.dbType && !field.isVirtual) && (
                <>
                  <dt className="mt-2 mb-1 px-4 text-xs uppercase text-gray-500">
                    DB Type
                  </dt>
                  <dd className="px-4 py-1 text-sm flex items-center text-gray-900">
                    {field.dbType}
                  </dd>
                </>
              )}
            </dl>

            <ContextMenu.Separator className="my-2 h-0.5 bg-gray-100" />

            <ContextMenu.Label className="mt-2 mb-1 px-4 text-xs uppercase text-gray-500">
              Field Type
            </ContextMenu.Label>
            {isFieldTypeConvertable && canManageField
              ? (
                <ContextMenu.Root>
                  <ContextMenu.TriggerItem textValue="\t" className="px-4 py-1 text-sm cursor-pointer flex items-center text-gray-900 hover:bg-gray-100 focus:bg-gray-100">
                    <FieldTypeIcon fieldType={fieldType} className="mr-1.5" />
                    {fieldType.name}
                    <ChevronRightIcon className="ml-auto h-4 w-4" />
                  </ContextMenu.TriggerItem>
                  <ContextMenu.Content sideOffset={-2} className="py-2 block overflow-hidden rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 w-60">
                    {relatedFieldTypes.map((item) => (
                      <ContextMenu.Item
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
                      </ContextMenu.Item>
                    ))}
                  </ContextMenu.Content>
                </ContextMenu.Root>
              ) : (
                <ContextMenu.Item textValue="\t" className="px-4 py-1 text-sm flex items-center text-gray-900">
                  <FieldTypeIcon fieldType={fieldType} className="mr-1.5" />
                  {fieldType.name}
                </ContextMenu.Item>
              )}

            {field.isPrimaryKey && (
              <ContextMenu.Item textValue="\t" className="px-4 py-1 text-sm flex items-center text-gray-900">
                <FieldTypeIcon className="mr-1.5" isPrimaryKey />
                Primary Key
              </ContextMenu.Item>
            )}
            {field.isForeignKey && (
              <ContextMenu.Item textValue="\t" className="px-4 py-1 text-sm flex items-center text-gray-900">
                <FieldTypeIcon className="mr-1.5" isForeignKey />
                Foreign Key
              </ContextMenu.Item>
            )}

            {canManageView && <ContextMenu.Separator className="my-2 h-0.5 bg-gray-100" />}
            <FieldOptions table={table} field={field} setOpen={setOpen} />
            {canChangeGuestAccess && (
              <>
                {fieldType.name === FieldType.CURRENCY && <FormatCurrencyOption field={field} />}
                <ContextMenu.Item
                  textValue="\t"
                  className="px-4 py-1 text-sm cursor-pointer flex items-center hover:bg-gray-100 focus:bg-gray-100"
                  onSelect={handlePermissions}
                >
                  <LockClosedIcon className="h-4 w-4 mr-1.5" />
                  Permissions
                </ContextMenu.Item>
              </>
            )}
            {canManageView && (
              <ContextMenu.Item
                textValue="\t"
                className="px-4 py-1 text-sm cursor-pointer flex items-center hover:bg-gray-100 focus:bg-gray-100"
                onSelect={handleHideField}
              >
                <EyeOffIcon className="h-4 w-4 mr-1.5" />
                Hide
              </ContextMenu.Item>
            )}
            <FieldMenuDrop
              field={field}
              setConfirmModal={setConfirmModal}
            />
          </div>
        </ContextMenu.Content>
      </ContextMenu.Root>

      {confirmModal.open && (
        <ConfirmationModal
          open={confirmModal.open}
          setOpen={(value) => setConfirmModal((curVal) => ({ ...curVal, open: value }))}
          title={confirmModal.title}
          description={confirmModal.description}
          onConfirm={confirmModal.onConfirm}
          loading={loading}
        />
      )}
    </>
  );
}

FieldMenu.propTypes = {
  id: PropTypes.any.isRequired,
  data: PropTypes.object.isRequired,
  table: PropTypes.object.isRequired,
  field: PropTypes.object.isRequired,
};
