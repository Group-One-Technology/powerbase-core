import React from 'react';
import PropTypes from 'prop-types';
import { EyeOffIcon, LockClosedIcon } from '@heroicons/react/outline';

import { useSaveStatus } from '@models/SaveStatus';
import { useViewFieldState } from '@models/view/ViewFieldState';
import { useBaseUser } from '@models/BaseUser';
import { useFieldPermissionsModal } from '@models/modals/FieldPermissionsModal';
import { useTableView } from '@models/TableView';
import { useFieldTypes } from '@models/FieldTypes';
import { hideViewField } from '@lib/api/view-fields';
import { FieldType } from '@lib/constants/field-types';
import { captureError } from '@lib/helpers/captureError';
import { PERMISSIONS } from '@lib/constants/permissions';

import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';
import { FieldOptions } from './FieldOptions';
import { FormatCurrencyOption } from './FormatCurrencyOption';
import { FieldMenuDrop } from './FieldMenuDrop';
import { FieldTypeMenu } from './FieldTypeMenu';

export function FieldMenu({
  table,
  field,
  alias,
  setAlias,
  close,
  setConfirmModal,
}) {
  const { saving, catchError, saved } = useSaveStatus();
  const { baseUser } = useBaseUser();
  const { data: view } = useTableView();
  const { data: fieldTypes } = useFieldTypes();
  const { fields, setFields, mutateViewFields } = useViewFieldState();
  const { modal: permissionsModal } = useFieldPermissionsModal();

  const fieldType = fieldTypes.find((item) => item.id === field.fieldTypeId);

  const canManageView = baseUser?.can(PERMISSIONS.ManageView, view);
  const canManageField = baseUser?.can(PERMISSIONS.ManageField, field);
  const canChangeGuestAccess = baseUser?.can(PERMISSIONS.ChangeGuestAccess);

  const handleAliasChange = (evt) => setAlias(evt.target.value);

  const handlePermissions = () => {
    if (!canChangeGuestAccess) return;
    permissionsModal.open(field);
  };

  const handleHideField = async () => {
    if (!canManageView) return;
    saving();

    const updatedFields = fields.map((item) => ({
      ...item,
      isHidden: item.id === field.id
        ? true
        : item.isHidden,
    }));

    setFields(updatedFields);

    try {
      await hideViewField({ id: field.id });
      await mutateViewFields(updatedFields);
      saved();
    } catch (err) {
      captureError(err);
      catchError(err);
    }
  };

  return (
    <>
      <div className="block overflow-hidden rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 w-60">
        <div className="py-2">
          <h1 className="sr-only">Field Menu</h1>
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

          <h2 className="sr-only">Field Info</h2>
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

          <div role="separator" className="my-2 h-0.5 bg-gray-100" />

          <h2 className="mt-2 mb-1 px-4 text-xs uppercase text-gray-500">
            Field Type
          </h2>
          <ul className="flex flex-col">
            <li className="w-full">
              <FieldTypeMenu
                field={field}
                fieldType={fieldType}
                canManageField={canManageField}
                close={close}
              />
            </li>

            {field.isPrimaryKey && (
              <li className="px-4 py-1 w-full text-sm flex items-center text-gray-900">
                <FieldTypeIcon className="mr-1.5" isPrimaryKey />
                Primary Key
              </li>
            )}

            {field.isForeignKey && (
              <li className="px-4 py-1 w-full text-sm flex items-center text-gray-900">
                <FieldTypeIcon className="mr-1.5" isForeignKey />
                Foreign Key
              </li>
            )}
          </ul>

          <div role="separator" className="my-2 h-0.5 bg-gray-100" />

          <h2 className="sr-only">Field Options</h2>
          <FieldOptions table={table} field={field} close={close} />

          {canChangeGuestAccess && (
            <>
              {fieldType.name === FieldType.CURRENCY && <FormatCurrencyOption field={field} close={close} />}
              <button
                type="button"
                className="px-4 py-1 w-full text-sm cursor-pointer flex items-center hover:bg-gray-100 focus:bg-gray-100"
                onClick={handlePermissions}
              >
                <LockClosedIcon className="h-4 w-4 mr-1.5" />
                Permissions
              </button>
            </>
          )}

          {canManageView && (
            <button
              type="button"
              className="px-4 py-1 w-full text-sm cursor-pointer flex items-center hover:bg-gray-100 focus:bg-gray-100"
              onClick={handleHideField}
            >
              <EyeOffIcon className="h-4 w-4 mr-1.5" />
              Hide
            </button>
          )}

          <FieldMenuDrop
            field={field}
            setConfirmModal={setConfirmModal}
          />
        </div>
      </div>
    </>
  );
}

FieldMenu.propTypes = {
  table: PropTypes.object.isRequired,
  field: PropTypes.object.isRequired,
  alias: PropTypes.string,
  setAlias: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  setConfirmModal: PropTypes.func.isRequired,
};
