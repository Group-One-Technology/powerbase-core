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

import { useTableRecords } from '@models/TableRecords';
import { updateTableView } from '@lib/api/views';
import { IViewField } from '@lib/propTypes/view_field';
import { IView } from '@lib/propTypes/view';
import { mutate } from 'swr';
import { useRecordsFilter } from '@models/views/RecordsFilter';

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

export function TableViewsFilter({ view, fields }) {
  const filterRef = useRef();
  const { filters, setFilters } = useRecordsFilter();
  const { mutate: mutateTableRecords } = useTableRecords();

  const filterValue = filters?.value || undefined;
  const initialOperator = filterValue
    ? Object.keys(filterValue)[0]
    : undefined;
  const initialFieldType = (initialOperator && filterValue
    && typeof filterValue[initialOperator][1].value === 'number')
    ? 'number'
    : 'text';

  const [firstOperand, setFirstOperand] = useState(initialOperator
    ? filterValue[initialOperator][0].field
    : '');
  const [operators, setOperators] = useState(initialFieldType === 'number'
    ? NUMBER_OPERATORS
    : TEXT_OPERATORS);
  const [operator, setOperator] = useState(filters
    ? Object.keys(OPERATOR).find((key) => (
      OPERATOR[key] === Object.keys(filters)[0]
    ))
    : undefined);
  const [secondOperand, setSecondOperand] = useState(initialOperator
    ? filterValue[initialOperator][1].value
    : '');
  const [fieldType, setFieldType] = useState(initialFieldType);

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

  useEffect(() => {
    if (filterValue) {
      setFirstOperand(initialOperator
        ? fields?.find((field) => field.name === filterValue[initialOperator][0].field)
        : '');
      setOperators(initialFieldType === 'number'
        ? NUMBER_OPERATORS
        : TEXT_OPERATORS);
      setOperator(filterValue
        ? Object.keys(OPERATOR).find((key) => (
          OPERATOR[key] === Object.keys(filterValue)[0]
        ))
        : undefined);
      setSecondOperand(initialOperator
        ? filterValue[initialOperator][1].value
        : '');
      setFieldType(initialFieldType);
    }
  }, [view]);

  const updateTableRecords = useCallback(debounce(async ({
    reset,
    operatorPayload,
    firstOperandPayload,
    secondOperandPayload,
  }) => {
    if (reset) {
      setFilters(undefined);
      updateTableView({
        id: view.id,
        filters: null,
      });
    } else if (operatorPayload && firstOperandPayload && secondOperandPayload) {
      const updatedFilter = {
        id: `${firstOperandPayload}:${operatorPayload}=${secondOperandPayload}`,
        value: {
          [OPERATOR[operatorPayload]]: [
            { field: firstOperandPayload },
            { value: secondOperandPayload },
          ],
        },
      };

      setFilters(updatedFilter);
      updateTableView({
        id: view.id,
        filters: updatedFilter,
      });
      mutate(`/tables/${view.tableId}/views`);
      mutate(`/views/${view.id}`);
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
        firstOperandPayload: selectedField.name,
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
                      value={firstOperand?.id}
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
  view: IView.isRequired,
  fields: PropTypes.arrayOf(IViewField),
};
