import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import * as Tooltip from '@radix-ui/react-tooltip';

import { useBase } from '@models/Base';
import { useSaveStatus } from '@models/SaveStatus';
import { useAuthUser } from '@models/AuthUser';
import { disconnectDatabase } from '@lib/api/databases';
import { Button } from '@components/ui/Button';
import { ConfirmationModal } from '@components/ui/ConfirmationModal';

export function DisconnectBase() {
  const history = useHistory();
  const { authUser } = useAuthUser();
  const { data: base } = useBase();
  const {
    saved, saving, catchError, loading,
  } = useSaveStatus();
  const isOwner = authUser?.id === base?.userId;

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: 'Disconnect Base',
    description: 'Are you sure you want to disconnect to this base? This action cannot be undone.',
  });

  const handleConfirmDisconnect = () => {
    setConfirmModal((val) => ({ ...val, open: true }));
  };

  const handleDisconnectBase = async () => {
    if (base) {
      saving();
      const { id, name } = base;

      try {
        await disconnectDatabase({ id });
        history.push('/');
        saved(`Successfully disconnect the "${name}" base.`);
      } catch (err) {
        catchError(err.response.data.exception || err.response.data.error);
      }
    }
  };

  if (!isOwner) {
    return (
      <Tooltip.Root delayDuration={0}>
        <Tooltip.Trigger
          type="button"
          className="border border-gray-300 text-gray-900 bg-gray-100 rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
        >
          Disconnect Database
        </Tooltip.Trigger>
        <Tooltip.Content className="py-1 px-2 bg-gray-900 text-white text-xs rounded">
          <Tooltip.Arrow className="gray-900" />
          Only the owner can disconnect the database.
        </Tooltip.Content>
      </Tooltip.Root>
    );
  }

  return (
    <>
      <Button
        type="button"
        className="border border-red-500 text-red-500 rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        onClick={handleConfirmDisconnect}
        disabled={!base || !isOwner}
      >
        Disconnect Database
      </Button>

      <ConfirmationModal
        open={confirmModal.open}
        setOpen={(value) => setConfirmModal((curVal) => ({ ...curVal, open: value }))}
        title={confirmModal.title}
        description={confirmModal.description}
        onConfirm={handleDisconnectBase}
        loading={loading}
      />
    </>
  );
}
