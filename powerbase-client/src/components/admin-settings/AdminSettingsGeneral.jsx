import React, { useEffect, useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { useBases } from '@models/Bases';

import { useGeneralSettings } from '@models/GeneralSettings';
import { useData } from '@lib/hooks/useData';
import { setupGeneralSettings } from '@lib/api/settings';

import { ErrorAlert } from '@components/ui/ErrorAlert';
import { Button } from '@components/ui/Button';
import { SampleDBSelect } from './general/SampleDBSelect';

export function AdminSettingsGeneral() {
  const { data: generalSettings, mutate: mutateGeneralSettings } = useGeneralSettings();
  const { status, error, dispatch } = useData();
  const { data: bases } = useBases();

  const [sampleDatabase, setSampleDatabase] = useState(null);
  const sampleBase = generalSettings?.sampleDatabase?.id && bases?.length
    ? bases.filter((item) => item.id === generalSettings.sampleDatabase.id)
    : null;
  const basesOptions = sampleBase == null && generalSettings?.sampleDatabase != null && bases != null
    ? [...bases, generalSettings.sampleDatabase]
    : bases;

  useEffect(() => {
    if (generalSettings == null || Object.keys(generalSettings || {}).length === 0) return;
    setSampleDatabase(generalSettings.sampleDatabase);
  }, [generalSettings]);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    dispatch.pending();

    try {
      await setupGeneralSettings({
        sampleDatabaseId: sampleDatabase?.id ?? null,
      });
      mutateGeneralSettings();
      dispatch.resolved('', 'Successfully updated general settings.');
    } catch (err) {
      dispatch.rejected(err.response.data.exception || err.response.data.error, true);
    }
  };

  return (
    <Tabs.Content value="General">
      <div className="py-6 px-12">
        <div className="my-4 max-w-lg">
          <h2 className="text-xl leading-6 font-bold text-gray-90">
            General Settings
          </h2>
          <p className="my-2 text-gray-700 text-sm">
            Configure the general settings for Powerbase.
          </p>
          {error && <ErrorAlert errors={error} />}
          <form className="mt-6 space-y-4 w-full" onSubmit={handleSubmit} aria-busy={status === 'pending'}>
            <SampleDBSelect
              value={sampleDatabase}
              setValue={setSampleDatabase}
              options={basesOptions}
            />

            <div className="flex gap-4">
              <Button
                type="submit"
                className="inline-flex items-center justify-center border border-transparent font-medium px-6 py-2 text-base rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                loading={status === 'pending'}
              >
                Save changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Tabs.Content>
  );
}
