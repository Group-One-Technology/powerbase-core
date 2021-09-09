import React, { useState } from 'react';
import { useValidState } from '@lib/hooks/useValidState';
import { REQUIRED_VALIDATOR } from '@lib/validators/REQUIRED_VALIDATOR';

import { InlineInput } from '@components/ui/InlineInput';
import { InlineColorRadio } from '@components/ui/InlineColorRadio';
import { Button } from '@components/ui/Button';
import { ConnectBaseModal } from '@components/bases/ConnectBaseModal';

// TODO: Add scope multiple select
// See: https://legacydocs.hubspot.com/docs/methods/oauth2/initiate-oauth-integration
export function ConnectHubspotForm() {
  const [name, setName, nameError] = useValidState('', REQUIRED_VALIDATOR);
  const [apiKey, setApiKey, apiKeyError] = useValidState('', REQUIRED_VALIDATOR);
  const [color, setColor, colorError] = useValidState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState();
  const [modalContent, setModalContent] = useState();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    setError(undefined);
    setModalContent(undefined);

    if (!color.length) {
      colorError.setError(new Error('Required'));
      setLoading(false);
      return;
    }

    const hasErrors = !apiKey.length
      || !!apiKeyError.error;

    if (!hasErrors) {
      console.log({
        name,
        apiKey,
        color,
      });
      setModalContent(`Hubspot base with name of ${name} and color of ${color} has been added.`);
    }

    setIsModalOpen(true);
    setLoading(false);
  };

  return (
    <>
      <div className="max-w-2xl mx-auto">
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
            label="API Key"
            name="api-key"
            placeholder="e.g. enter your hubspot client_id here"
            value={apiKey}
            onChange={(evt) => setApiKey(evt.target.value)}
            error={apiKeyError.error}
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
          <div className="grid grid-cols-12 my-6">
            <div className="col-start-4 col-span-9">
              <Button
                type="submit"
                className="w-full inline-flex items-center justify-center border border-transparent font-medium px-4 py-2 text-base rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                loading={loading}
              >
                Connect and Save
              </Button>
            </div>
          </div>
        </form>
      </div>
      <ConnectBaseModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        content={modalContent}
        error={error}
      />
    </>
  );
}
