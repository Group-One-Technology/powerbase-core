import React, {
  Fragment,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { Popover, Transition } from '@headlessui/react';
import { PlusIcon, FilterIcon, TrashIcon } from '@heroicons/react/outline';
import cn from 'classnames';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';

import { IViewField } from '@lib/propTypes/view_field';
import { useTableRecords } from '@models/TableRecords';
import { updateTableView } from '@lib/api/views';
import { IId } from '@lib/propTypes/common';

const NUMBER_FIELD_TYPE = 4;

const TEXT_OPERATORS = [
  'Is',
  'Contains',
];

const NUMBER_OPERATORS = [
  '=',
  '!=',
  '>',
  '>=',
  '<',
  '<=',
];

const OPERATOR = {
  Is: 'eq',
  Contains: 'like',
  '=': 'eq',
  '!=': 'neq',
  '>': 'gt',
  '>=': 'gte',
  '<': 'lt',
  '<=': 'lte',
};
export function TableViewsFilter({ viewId, fields }) {
  const filterRef = useRef();
  const [firstOperand, setFirstOperand] = useState('');
  const [operators, setOperators] = useState([]);
  const [operator, setOperator] = useState();
  const [secondOperand, setSecondOperand] = useState('');
  const [fieldType, setFieldType] = useState('number');
  const { setFilters, mutate: mutateTableRecords } = useTableRecords();

  useEffect(() => {
    if (!firstOperand && fields) {
      const [firstField] = fields;
      const isNumber = firstField.fieldTypeId === NUMBER_FIELD_TYPE;

      setFirstOperand(firstField);
      setFieldType(isNumber ? 'number' : 'text');
      setOperators(isNumber ? NUMBER_OPERATORS : TEXT_OPERATORS);
      setOperator(isNumber ? NUMBER_OPERATORS[0] : TEXT_OPERATORS[0]);
    }
  }, [fields]);

  const updateTableRecords = useCallback(debounce(async ({
    reset,
    operatorPayload,
    firstOperandPayload,
    secondOperandPayload,
  }) => {
    if (reset) {
      setFilters(undefined);
      await updateTableView({
        id: viewId,
        filters: null,
      });
    } else {
      const secondOperandValue = OPERATOR[operatorPayload] === 'like'
        ? `%${secondOperandPayload}%`
        : secondOperandPayload;

      const updatedFilter = {
        id: `${firstOperandPayload}:${operatorPayload}=${secondOperandValue}`,
        value: {
          [OPERATOR[operatorPayload]]: [
            { field: firstOperandPayload },
            { value: secondOperandValue },
          ],
        },
      };

      setFilters(updatedFilter);
      await updateTableView({
        id: viewId,
        filters: updatedFilter.value,
      });
    }

    await mutateTableRecords();
  }, 500), []);

  if (fields == null) return null;

  const handleFirstOperandChange = (evt) => {
    const selectedField = fields?.find((field) => (
      field.id.toString() === evt.target.value.toString()
    ));
    const selectedFieldType = selectedField.fieldTypeId === NUMBER_FIELD_TYPE ? 'number' : 'text';
    setFirstOperand(selectedField);
    setFieldType(selectedFieldType);
    setOperators(selectedFieldType === 'number' ? NUMBER_OPERATORS : TEXT_OPERATORS);
    setOperator(selectedFieldType === 'number' ? NUMBER_OPERATORS[0] : TEXT_OPERATORS[0]);
    setSecondOperand('');

    if (operator != null && selectedField != null
      && ((selectedFieldType === 'number' && typeof secondOperand === 'number')
        || (selectedFieldType === 'text' && secondOperand.length))) {
      updateTableRecords({
        operatorPayload: operator,
        firstOperandPayload: selectedField,
        secondOperandPayload: secondOperand,
      });
    }
  };

  const handleOperatorChange = (evt) => {
    const { value } = evt.target;
    setOperator(value);

    if (value != null && firstOperand != null
      && ((fieldType === 'number' && typeof secondOperand === 'number')
        || (fieldType === 'text' && secondOperand.length))) {
      updateTableRecords({
        operatorPayload: value,
        firstOperandPayload: firstOperand.name,
        secondOperandPayload: secondOperand,
      });
    }
  };

  const handleSecondOperandChange = async (evt) => {
    const value = fieldType === 'number' ? Number(evt.target.value) : evt.target.value;

    if (fieldType === 'number') {
      setSecondOperand(!Number.isNaN(value) ? value : 0);
    } else {
      setSecondOperand(value);
    }

    if (operator != null && firstOperand != null
      && ((fieldType === 'number' && typeof value === 'number')
        || (fieldType === 'text' && value.length))) {
      updateTableRecords({
        operatorPayload: operator,
        firstOperandPayload: firstOperand.name,
        secondOperandPayload: value,
      });
    }
  };

  const removeFilter = () => {
    if (filterRef.current) {
      filterRef.current.remove();
      updateTableRecords({ reset: true });
    }
  };

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={cn('inline-flex items-center px-1.5 py-1 border border-transparent text-xs font-medium rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 ring-offset-2 ring-gray-500', {
              'ring-2': open,
            })}
          >
            <span className="sr-only">Filter fields</span>
            <FilterIcon className="block h-4 w-4" />
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute z-10 w-screen max-w-sm px-4 mt-3 transform -translate-x-1/2 left-1/2 sm:px-0 lg:max-w-3xl">
              <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="bg-white p-4 text-sm">
                  <div ref={filterRef} className="flex gap-x-2 items-center">
                    <p className="inline w-80">Where</p>
                    <label htmlFor="firstOperand" className="sr-only">First Operand (Field)</label>
                    <select
                      id="firstOperand"
                      name="first_operand"
                      className="block w-full text-sm h-8 p-1 focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
                      value={firstOperand.id}
                      onChange={handleFirstOperandChange}
                    >
                      {fields?.map((field) => (
                        <option key={field.name} value={field.id}>
                          {field.name}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="operator" className="sr-only">Operator</label>
                    <select
                      id="operator"
                      name="operator"
                      className="block w-full text-sm h-8 p-1 focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
                      value={operator}
                      onChange={handleOperatorChange}
                    >
                      {operators?.map((op) => <option key={op} value={op}>{op}</option>)}
                    </select>
                    <input
                      id="secondOperand"
                      type={fieldType}
                      aria-label="Second Operand"
                      name="second_operand"
                      value={secondOperand}
                      onChange={handleSecondOperandChange}
                      className={cn('appearance-none block w-full px-3 py-1 border rounded-md shadow-sm placeholder-gray-400 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm')}
                      required
                    />
                    <button
                      type="button"
                      className="inline-flex items-center px-1.5 py-1 border border-transparent text-xs font-medium rounded text-gray-700 hover:bg-red-100 focus:outline-none focus:ring-2 ring-offset-2"
                      onClick={() => removeFilter('filter-1')}
                    >
                      <span className="sr-only">Remove Filter</span>
                      <TrashIcon className="block h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-1 bg-gray-50">
                  <button
                    type="button"
                    className="p-2 w-full text-left text-xs flex items-center transition duration-150 ease-in-out rounded-md hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
                  >
                    <PlusIcon className="mr-1 h-4 w-4" />
                    Add a filter
                  </button>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}

TableViewsFilter.propTypes = {
  viewId: IId.isRequired,
  fields: PropTypes.arrayOf(IViewField),
};
