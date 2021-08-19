import React, { useState } from 'react';
import { useValidState } from '@lib/hooks/useValidState';
import { REQUIRED_VALIDATOR } from '@lib/validators/REQUIRED_VALIDATOR';
import { POWERBASE_TYPE } from '@lib/constants';

import { InlineInput } from '@components/ui/InlineInput';
import { InlineColorRadio } from '@components/ui/InlineColorRadio';
import { Button } from '@components/ui/Button';
import { InlineRadio } from '@components/ui/InlineRadio';
import { ConnectBaseModal } from '@components/bases/ConnectBaseModal';

// TODO: Add scope multiple select
// See: https://shopify.dev/apps/auth/oauth
export function ConnectShopifyForm() {
  const [name, setName, nameError] = useValidState('', REQUIRED_VALIDATOR);
  const [shop, setShop, shopError] = useValidState('', REQUIRED_VALIDATOR);
  const [apiKey, setApiKey, apiKeyError] = useValidState('', REQUIRED_VALIDATOR);
  const [powerbaseType, setPowerbaseType] = useState(POWERBASE_TYPE[0]);
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
      setModalContent(`Shopify base with name of ${name} and color of ${color} has been added.`);
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
            label="Shop's Name"
            name="shop"
            placeholder="e.g. flowershop or mikeys-shoes"
            value={shop}
            onChange={(evt) => setShop(evt.target.value.toLowerCase())}
            error={shopError.error}
            className="my-6"
            required
          />
          <InlineInput
            type="text"
            label="API Key"
            name="api-key"
            placeholder="e.g. enter your shopify client_id here"
            value={apiKey}
            onChange={(evt) => setApiKey(evt.target.value)}
            error={apiKeyError.error}
            className="my-6"
            required
          />
          <InlineRadio
            label="Powerbase Type"
            value={powerbaseType}
            setValue={setPowerbaseType}
            options={POWERBASE_TYPE}
            className="my-6"
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
                size="lg"
                className="w-full justify-center"
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
