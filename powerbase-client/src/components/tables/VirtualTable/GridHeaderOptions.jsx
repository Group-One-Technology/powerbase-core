import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import * as Popover from '@radix-ui/react-popover';
import { useFieldTypes } from '@models/FieldTypes';
import { FieldTypeIcon } from '@components/ui/FieldTypeIcon';
import {
  EyeOffIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from '@heroicons/react/outline';

import { useViewFields } from '@models/ViewFields';
import { hideViewField } from '@lib/api/view-fields';

export function GridHeaderOptions({ option, field, setOptionOpen }) {
  const { data: fields, mutate: mutateViewFields } = useViewFields();
  const { data: fieldTypes } = useFieldTypes();
  const fieldType = fieldTypes.find((item) => item.id === field.fieldTypeId);

  const [alias, setAlias] = useState(field.name);

  useEffect(() => {
    setAlias(field.name);
  }, [field]);

  const handleAliasChange = (evt) => {
    setAlias(evt.target.value);
  };

  const handleHideField = async () => {
    try {
      await hideViewField({ id: field.id });
      const updatedFields = fields.map((item) => ({
        ...item,
        isHidden: item.id === field.id
          ? true
          : item.isHidden,
      }));

      mutateViewFields(updatedFields);
    } catch (err) {
      console.log(err);
    }

    setOptionOpen(false);
  };

  return (
    <Popover.Root open={option.open} onOpenChange={setOptionOpen}>
      <Popover.Trigger className={`button_field_${field.id}`} />
      <Popover.Content side="bottom" sideOffset={10} align="start" alignOffset={-10}>
        <div className="block overflow-hidden rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 w-60">
          <div className="py-4 border border-b border-gray-100">
            <div className="px-4 w-auto border-b border-gray-200">
              <input
                type="text"
                aria-label="Field Name"
                value={alias}
                onChange={handleAliasChange}
                placeholder="Field Name"
                className="appearance-none block w-full p-1 text-sm text-gray-900 border rounded-md shadow-sm placeholder-gray-400 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <div className="mt-4">
                <p className="mb-1 uppercase text-gray-500 text-xs">Property Type</p>
                <div className="pt-1 pb-2 text-sm flex items-center text-gray-900">
                  <FieldTypeIcon fieldType={fieldType} className="mr-1.5" />
                  {fieldType.name}
                </div>
              </div>
            </div>
            <ul className="mt-1 text-sm text-gray-900">
              <li className="px-4 hover:bg-gray-100 focus:bg-gray-100">
                <button type="button" className="py-1 w-full flex items-center cursor-not-allowed">
                  <ArrowRightIcon className="h-4 w-4 mr-1.5" />
                  Insert right
                </button>
              </li>
              <li className="px-4 hover:bg-gray-100 focus:bg-gray-100">
                <button type="button" className="py-1 w-full flex items-center cursor-not-allowed">
                  <ArrowLeftIcon className="h-4 w-4 mr-1.5" />
                  Insert left
                </button>
              </li>
              <li className="px-4 hover:bg-gray-100 focus:bg-gray-100">
                <button
                  type="button"
                  className="py-1 w-full flex items-center"
                  onClick={handleHideField}
                >
                  <EyeOffIcon className="h-4 w-4 mr-1.5" />
                  Hide
                </button>
              </li>
              <li className="px-4 hover:bg-gray-100 focus:bg-gray-100">
                <button type="button" className="py-1 w-full flex items-center cursor-not-allowed">
                  <ShieldCheckIcon className="h-4 w-4 mr-1.5" />
                  Set as PII
                </button>
              </li>
            </ul>
          </div>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}

GridHeaderOptions.propTypes = {
  option: PropTypes.object.isRequired,
  field: PropTypes.object.isRequired,
  setOptionOpen: PropTypes.func.isRequired,
};
