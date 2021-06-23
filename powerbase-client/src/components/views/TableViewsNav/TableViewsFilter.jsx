/* eslint-disable max-len */
import React, { Fragment, useEffect, useState } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { PlusIcon, FilterIcon } from '@heroicons/react/outline';
import cn from 'classnames';
import PropTypes from 'prop-types';

import { IViewField } from '@lib/propTypes/view_field';

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

export function TableViewsFilter({ fields }) {
  const [firstOperand, setFirstOperand] = useState('');
  const [operators, setOperators] = useState([]);
  const [operator, setOperator] = useState();
  const [secondOperand, setSecondOperand] = useState();

  useEffect(() => {
    if (!firstOperand && fields) {
      const [firstField] = fields;
      setFirstOperand(firstField);

      setOperators(firstField.fieldTypeId === NUMBER_FIELD_TYPE
        ? NUMBER_OPERATORS
        : TEXT_OPERATORS);
      setOperator(firstField.fieldTypeId === NUMBER_FIELD_TYPE
        ? NUMBER_OPERATORS[0]
        : TEXT_OPERATORS[0]);
    }
  }, [fields]);

  if (fields == null) return null;

  const handleFirstOperandChange = (evt) => {
    const selectedField = fields?.find((field) => field.id.toString() === evt.target.value.toString());
    setFirstOperand(selectedField);
    setOperators(selectedField.fieldTypeId === NUMBER_FIELD_TYPE
      ? NUMBER_OPERATORS
      : TEXT_OPERATORS);
  };

  const handleOperatorChange = (evt) => setOperator(evt.target.value);
  const handleSecondOperandChange = (evt) => setSecondOperand(evt.target.value);

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
                  <div className="grid grid-cols-4 gap-x-2">
                    <p className="">Where</p>
                    <label htmlFor="firstOperand" className="sr-only">First Operand (Field)</label>
                    <select
                      id="firstOperand"
                      name="first_operand"
                      className="block w-full text-sm h-8 p-1 focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
                      value={firstOperand}
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
                      type={firstOperand.fieldTypeId === NUMBER_FIELD_TYPE ? 'number' : 'text'}
                      aria-label="Second Operand"
                      name="second_operand"
                      value={secondOperand}
                      onChange={handleSecondOperandChange}
                      className={cn('appearance-none block w-full px-3 py-1 border rounded-md shadow-sm placeholder-gray-400 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm')}
                      required
                    />
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
  fields: PropTypes.arrayOf(IViewField),
};
