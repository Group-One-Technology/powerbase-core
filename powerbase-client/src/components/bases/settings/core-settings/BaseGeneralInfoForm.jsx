import React, { useState } from 'react';
import PropTypes from 'prop-types';

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
