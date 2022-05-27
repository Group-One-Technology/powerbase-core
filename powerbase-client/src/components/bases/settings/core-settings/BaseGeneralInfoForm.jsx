import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { Switch } from '@headlessui/react';

import { useBase } from '@models/Base';
import { useBases } from '@models/Bases';
import { useSharedBases } from '@models/SharedBases';
import { useValidState } from '@lib/hooks/useValidState';
import { REQUIRED_VALIDATOR } from '@lib/validators/REQUIRED_VALIDATOR';
import { DATABASE_TYPES, POWERBASE_TYPE } from '@lib/constants/bases';
import { updateDatabaseGeneralInfo } from '@lib/api/databases';
import { useMounted } from '@lib/hooks/useMounted';

import { InlineInput } from '@components/ui/InlineInput';
import { InlineSelect } from '@components/ui/InlineSelect';
import { InlineRadio } from '@components/ui/InlineRadio';
import { InlineColorRadio } from '@components/ui/InlineColorRadio';
import { Button } from '@components/ui/Button';
import { DisconnectBase } from '../DisconnectBase';

export function BaseGeneralInfoForm({ handleInit, handleSuccess, handleError }) {
  const { mounted } = useMounted();
  const { data: base, mutate: mutateBase } = useBase();
  const { mutate: mutateBases } = useBases();
  const { mutate: mutateSharedBases } = useSharedBases();

  const [name, setName, nameError] = useValidState(base.name, REQUIRED_VALIDATOR);
  const [databaseType, setDatabaseType] = useState(DATABASE_TYPES.find((item) => item.value === base.adapter));
  const [powerbaseType, setPowerbaseType] = useState(POWERBASE_TYPE[base.isTurbo ? 0 : 1]);
  const [color, setColor, colorError] = useValidState(base.color);
  const [enableMagicData, setEnableMagicData] = useState(base.enableMagicData);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (nameError.error) return;

    handleInit();
    setLoading(true);

    if (!color.length) {
      colorError.setError(new Error('Required'));
      setLoading(false);
      return;
    }

    try {
      await updateDatabaseGeneralInfo({
        id: base.id,
        name,
        color,
        enableMagicData,
      });

      mounted(() => setLoading(false));
      handleSuccess();
      mutateBases();
      mutateSharedBases();
      await mutateBase();
    } catch (err) {
      mounted(() => setLoading(false));
      handleError(err?.response?.data.exception);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="mt-4 text-lg font-medium text-gray-900">General Info</h3>
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
      <InlineSelect
        label="Type"
        value={databaseType}
        setValue={setDatabaseType}
        options={DATABASE_TYPES}
        className="my-6"
        disabled
      />
      <InlineRadio
        label="Powerbase Type"
        value={powerbaseType}
        setValue={setPowerbaseType}
        options={POWERBASE_TYPE}
        className="my-6"
        disabled
      />
      <InlineColorRadio
        value={color}
        setValue={setColor}
        error={colorError.error}
        setError={colorError.setError}
        className="my-6"
      />

      <Switch.Group as="div" className="flex justify-between gap-20">
        <span className="flex-grow flex flex-col">
          <Switch.Label as="span" className="text-base font-medium text-gray-700" passive>
            Enable Magic Tables and Fields
          </Switch.Label>
          <Switch.Description as="span" className="text-sm text-gray-500">
            Magic tables and fields are accessible thru Powerbase but does not affect your current database. This is useful for storing data which you don&apos;t want to persist to your SQL database (e.g. comments magic field in a projects SQL table). For non-turbo bases, we store the primary keys as reference for the magic values.
          </Switch.Description>
        </span>
        <Switch
          checked={enableMagicData}
          onChange={setEnableMagicData}
          className={cn(
            'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
            enableMagicData ? 'bg-indigo-600' : 'bg-gray-200',
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
              enableMagicData ? 'translate-x-5' : 'translate-x-0',
            )}
          />
        </Switch>
      </Switch.Group>

      <div className="mt-4 py-4 border-t border-solid flex justify-between">
        <DisconnectBase />
        <Button
          type="submit"
          className="py-2 px-4 flex justify-center border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          loading={loading}
          disabled={!base?.isMigrated}
        >
          Update Database Info
        </Button>
      </div>
    </form>
  );
}

BaseGeneralInfoForm.propTypes = {
  handleInit: PropTypes.func.isRequired,
  handleSuccess: PropTypes.func.isRequired,
  handleError: PropTypes.func.isRequired,
};
