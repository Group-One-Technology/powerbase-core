import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@components/ui/Button';
import { PlusIcon, XIcon } from '@heroicons/react/outline';
import { camelToSnakeCase } from '@lib/helpers/text/textTypeFormatters';

function OptionInput({ option, remove, update }) {
  const handleUpdateInput = (evt) => {
    update(camelToSnakeCase(evt.target.value));
  };

  return (
    <div className="flex">
      <input
        id={`create-field-select-option-${option.id}`}
        name={`create-field-select-option-${option.id}`}
        type="text"
        value={option.value}
        aria-label={`Select option #${option.id + 1} name`}
        placeholder="e.g. in_progress, finished, paid, etc."
        onChange={handleUpdateInput}
        className="px-3 py-2 block w-full rounded-md shadow-sm text-sm placeholder-gray-400 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
      />
      <Button
        type="button"
        className="ml-2 mt-1 px-3 py-2 inline-block rounded text-gray-500 text-sm capitalize hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:gray-500"
        onClick={remove}
      >
        <XIcon className="h-4 w-4" />
        <span className="sr-only">Remove Option</span>
      </Button>
    </div>
  );
}

OptionInput.propTypes = {
  option: PropTypes.object.isRequired,
  remove: PropTypes.func.isRequired,
  update: PropTypes.func.isRequired,
};

export function CreateFieldSelectOptions({ options, setOptions }) {
  const [count, setCount] = useState(1);

  const handleRemoveOption = (id) => {
    setOptions(options.filter((item) => item.id !== id));
  };

  const handleChangeOption = (id, value) => {
    setOptions(options.map((item) => ({
      ...item,
      value: item.id === id
        ? value
        : item.value,
    })));
  };

  const handleAddOption = () => {
    setOptions((items) => [
      ...items,
      { id: count, value: '' },
    ]);
    setCount((val) => val + 1);
  };

  return (
    <div className="my-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Options
      </label>
      <div className="flex flex-col gap-1">
        {options.map((option) => (
          <OptionInput
            key={option.id}
            option={option}
            remove={() => handleRemoveOption(option.id)}
            update={(val) => handleChangeOption(option.id, val)}
          />
        ))}
        <button
          type="button"
          className="inline-flex items-center p-2 text-xs text-gray-600 rounded-lg hover:bg-gray-200 focus:bg-gray-200"
          onClick={handleAddOption}
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add an option
        </button>
      </div>
    </div>
  );
}

CreateFieldSelectOptions.propTypes = {
  options: PropTypes.array.isRequired,
  setOptions: PropTypes.func.isRequired,
};
