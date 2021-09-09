import React, { useState } from 'react';

import { useValidState } from '@lib/hooks/useValidState';
import { REQUIRED_VALIDATOR } from '@lib/validators/REQUIRED_VALIDATOR';
import { IBase } from '@lib/propTypes/base';

import { Button } from '@components/ui/Button';
import { InlineColorRadio } from '@components/ui/InlineColorRadio';
import { InlineInput } from '@components/ui/InlineInput';
import { SQL_IDENTIFIER_VALIDATOR } from '@lib/validators/SQL_IDENTIFIER_VALIDATOR';

export function BaseCoreSettings({ base }) {
  const [name, setName, nameError] = useValidState(base.name, REQUIRED_VALIDATOR);
  const [databaseName, setDatabaseName, databaseNameError] = useValidState(
    base.databaseName,
    SQL_IDENTIFIER_VALIDATOR,
  );
  const [color, setColor, colorError] = useValidState(base.color);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);

    if (!color.length) {
      colorError.setError(new Error('Required'));
      setLoading(false);
      return;
    }

    const hasErrors = !!(!databaseName.length && databaseNameError.error);

    if (!hasErrors) {
      console.log({ name, databaseName, color });
    }

    setLoading(false);
  };

  return (
    <div className="py-6 px-4 sm:p-6 lg:pb-8">
      <h2 className="text-xl leading-6 font-medium text-gray-900">Core Settings</h2>
      <form onSubmit={handleSubmit}>
        <InlineInput
          type="text"
          label="Name"
          name="name"
          placeholder="e.g. Powerbase or Field Projects"
          value={name}
          onChange={(evt) => setName(evt.target.value)}
          error={nameError.error}
          className="my-6"
          required
        />
        <InlineInput
          type="text"
          label="Database Name"
          name="database-name"
          placeholder="e.g. powerbase or field_projects"
          value={databaseName}
          onChange={(evt) => setDatabaseName(evt.target.value)}
          error={databaseNameError.error}
          className="my-6"
          required
        />
        <InlineColorRadio
          value={color}
          setValue={setColor}
          error={colorError.error}
          setError={colorError.setError}
          className="my-6"
        />
        <div className="mt-4 py-4 border-t border-solid flex justify-end">
          <Button
            type="submit"
            className="ml-5 bg-sky-700 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            loading={loading}
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}

BaseCoreSettings.propTypes = {
  base: IBase.isRequired,
};
