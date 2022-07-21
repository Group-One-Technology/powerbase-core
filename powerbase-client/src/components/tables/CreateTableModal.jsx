import React, { useState } from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { ChevronDownIcon, ChevronUpIcon, XIcon } from '@heroicons/react/outline';
import { Dialog } from '@headlessui/react';
import * as Collapsible from '@radix-ui/react-collapsible';

import { useBase } from '@models/Base';
import { useFieldTypes } from '@models/FieldTypes';
import { useCurrentView } from '@models/views/CurrentTableView';
import { useValidState } from '@lib/hooks/useValidState';
import { SQL_IDENTIFIER_VALIDATOR } from '@lib/validators/SQL_IDENTIFIER_VALIDATOR';
import { REQUIRED_VALIDATOR } from '@lib/validators/REQUIRED_VALIDATOR';
import { TABLE_TYPE } from '@lib/constants/table';
import { useData } from '@lib/hooks/useData';
import { FieldType } from '@lib/constants/field-types';
import { createTable } from '@lib/api/tables';
import { useMounted } from '@lib/hooks/useMounted';

import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { InlineRadio } from '@components/ui/InlineRadio';
import { ErrorAlert } from '@components/ui/ErrorAlert';
import { CreateTableAlias } from './CreateTable/CreateTableAlias';
import { CreateTableName } from './CreateTable/CreateTableName';
import { CreateTableFields } from './CreateTable/CreateTableFields';

const PRIMARY_KEY_FIELD = {
  id: 0,
  name: 'id',
  alias: 'Id',
  dbType: 'integer',
  hasValidation: false,
  isNullable: false,
  isPii: false,
  isVirtual: false,
  isAutoIncrement: true,
  isPrimaryKey: true,
  options: null,
};

const NAME_FIELD = {
  id: 1,
  name: 'name',
  alias: 'Name',
  dbType: 'character varying(255)',
  hasValidation: true,
  isNullable: true,
  isPii: false,
  isVirtual: false,
  isAutoIncrement: false,
  isPrimaryKey: false,
  options: null,
};

export function CreateTableModal({ open, setOpen }) {
  const { mounted } = useMounted();
  const { data: base } = useBase();
  const { status, error, dispatch } = useData();
  const { data: fieldTypes } = useFieldTypes();
  const { mutateTables } = useCurrentView();

  const [tableName, setTableName, tableNameError] = useValidState('', SQL_IDENTIFIER_VALIDATOR);
  const [alias, setAlias, aliasError] = useValidState('', REQUIRED_VALIDATOR);
  const [tableType, setTableType] = useState(TABLE_TYPE[0]);
  const [fields, setFields] = useState([
    {
      ...PRIMARY_KEY_FIELD,
      fieldTypeId: fieldTypes?.find((item) => item.name === FieldType.NUMBER).id,
    },
    {
      ...NAME_FIELD,
      fieldTypeId: fieldTypes?.find((item) => item.name === FieldType.SINGLE_LINE_TEXT).id,
    },
  ]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const disabled = !!(aliasError.error || tableNameError.error);
  const isVirtual = tableType.nameId === 'magic_table';

  if (!base || !fieldTypes) return null;

  const cancel = () => setOpen(false);

  const resetInputs = () => {
    setTableName('', false);
    setAlias('', false);
    setTableType(TABLE_TYPE[0]);
    setFields([
      {
        ...PRIMARY_KEY_FIELD,
        fieldTypeId: fieldTypes?.find((item) => item.name === FieldType.NUMBER).id,
      },
      {
        ...NAME_FIELD,
        fieldTypeId: fieldTypes?.find((item) => item.name === FieldType.SINGLE_LINE_TEXT).id,
      },
    ]);
  };

  const submit = async (evt) => {
    evt.preventDefault();
    if (disabled || status === 'pending') return;

    if (fields.length === 0) {
      dispatch.rejected('There must be at least one field.');
      return;
    }

    const primaryKeys = fields.filter((item) => item.isPrimaryKey);

    if (primaryKeys.length === 0) {
      dispatch.rejected('There must be at least one primary key field.');
      return;
    }

    dispatch.pending();

    try {
      const data = await createTable({
        databaseId: base.id,
        name: tableName,
        alias,
        isVirtual,
        fields: isVirtual
          ? fields.map((item) => ({ ...item, isVirtual: true }))
          : fields,
      });
      mutateTables();
      mounted(() => {
        dispatch.resolved(data);
        resetInputs();
        setOpen(false);
      });
    } catch (err) {
      dispatch.rejected(err.response.data.exception || err.response.data.error);
    }
  };

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="inline-flex flex-col align-bottom bg-white rounded-lg text-left shadow-xl transform transition-all my-8 max-w-xl w-full sm:align-middle">
        <div className="hidden sm:block absolute top-0 right-0 pt-2 pr-2">
          <button
            type="button"
            className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setOpen(false)}
          >
            <span className="sr-only">Close</span>
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        <form className="mt-4 flex-1 py-4 px-6 flex flex-col" onSubmit={submit}>
          <Dialog.Title className="sr-only">Create Table</Dialog.Title>
          {error && <ErrorAlert errors={error} />}

          <CreateTableAlias
            baseId={base.id}
            alias={alias}
            setAlias={setAlias}
            aliasError={aliasError}
            setTableName={setTableName}
          />
          {base.enableMagicData && (
            <InlineRadio
              aria-label="Table Type"
              value={tableType}
              setValue={setTableType}
              options={TABLE_TYPE}
              className="mt-4"
            />
          )}
          <Collapsible.Root open={showAdvancedOptions} onOpenChange={setShowAdvancedOptions}>
            <div className="my-1 flex justify-end">
              <Collapsible.Trigger
                type="button"
                className="inline-flex items-center px-1 py-0.5 border border-transparent text-xs rounded text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                {showAdvancedOptions
                  ? <ChevronUpIcon className="h-3.5 w-3.5 mr-1" />
                  : <ChevronDownIcon className="h-3.5 w-3.5 mr-1" />}
                Advanced Options
              </Collapsible.Trigger>
            </div>
            <Collapsible.Content>
              <CreateTableName
                baseId={base.id}
                tableName={tableName}
                setTableName={setTableName}
                tableNameError={tableNameError}
                isVirtual={isVirtual}
              />
              <CreateTableFields
                tableName={tableName}
                isVirtual={isVirtual}
                fields={fields}
                setFields={setFields}
              />
            </Collapsible.Content>
          </Collapsible.Root>

          <div className="ml-auto mt-4">
            <button
              type="button"
              className={cn(
                'ml-auto mr-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
                status === 'pending'
                  ? 'cursor-not-allowed bg-gray-300 hover:bg-gray-400'
                  : 'cursor-pointer bg-white hover:bg-gray-50',
              )}
              onClick={cancel}
            >
              Cancel
            </button>
            <Button
              type="submit"
              className={cn(
                'inline-flex items-center justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm',
                !disabled
                  ? 'bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700 focus:ring-indigo-500'
                  : 'bg-gray-200 text-gray-900 cursor-not-allowed hover:bg-gray-100 focus:bg-gray-100',
              )}
              loading={status === 'pending'}
              disabled={disabled}
            >
              Create Table
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

CreateTableModal.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func.isRequired,
};
