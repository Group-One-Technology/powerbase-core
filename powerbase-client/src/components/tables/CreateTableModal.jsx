import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { XIcon } from '@heroicons/react/outline';
import { Dialog } from '@headlessui/react';

import { useBase } from '@models/Base';
import { useFieldTypes } from '@models/FieldTypes';
import { useValidState } from '@lib/hooks/useValidState';
import { SQL_IDENTIFIER_VALIDATOR } from '@lib/validators/SQL_IDENTIFIER_VALIDATOR';
import { REQUIRED_VALIDATOR } from '@lib/validators/REQUIRED_VALIDATOR';
import { TABLE_TYPE } from '@lib/constants/table';

import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { useViewFields } from '@models/ViewFields';
import { InlineRadio } from '@components/ui/InlineRadio';
import { CreateTableAlias } from './CreateTable/CreateTableAlias';
import { CreateTableName } from './CreateTable/CreateTableName';
import { CreateTableFields } from './CreateTable/CreateTableFields';

export function CreateTableModal({ open, setOpen }) {
  const { data: base } = useBase();
  const { data: fieldTypes } = useFieldTypes();
  const { data: viewFields } = useViewFields();

  const [tableName, setTableName, tableNameError] = useValidState('', SQL_IDENTIFIER_VALIDATOR);
  const [alias, setAlias, aliasError] = useValidState('', REQUIRED_VALIDATOR);
  const [tableType, setTableType] = useState(TABLE_TYPE[0]);
  const [fields, setFields] = useState([]);

  const disabled = false;
  const isVirtual = tableType.nameId === 'magic_table';

  useEffect(() => {
    setFields(viewFields || []);
  }, [viewFields]);

  if (!base || !fieldTypes) return null;

  const submit = async (evt) => {
    evt.preventDefault();
  };

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="inline-flex flex-col align-bottom bg-white min-h-[400px] rounded-lg text-left shadow-xl transform transition-all my-8 max-w-xl w-full sm:align-middle">
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
          <CreateTableAlias
            baseId={base.id}
            alias={alias}
            setAlias={setAlias}
            aliasError={aliasError}
            setTableName={setTableName}
          />
          <InlineRadio
            aria-label="Table Type"
            value={tableType}
            setValue={setTableType}
            options={TABLE_TYPE}
            className="mt-4"
          />
          <CreateTableName
            baseId={base.id}
            tableName={tableName}
            setTableName={setTableName}
            tableNameError={tableNameError}
            isVirtual={isVirtual}
          />
          <CreateTableFields
            fields={fields}
            setFields={setFields}
          />

          <div className="mt-auto mx-3">
            <Button
              type="submit"
              className={cn(
                'flex items-center justify-center ml-auto rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm',
                disabled
                  ? 'bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700 focus:ring-indigo-500'
                  : 'bg-gray-200 text-gray-900 cursor-not-allowed hover:bg-gray-100 focus:bg-gray-100',
              )}
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
