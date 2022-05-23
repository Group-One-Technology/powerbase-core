import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { MAX_SMALL_DATABASE_SIZE } from '@lib/constants/bases';
import { connectDatabase, createDatabase } from '@lib/api/databases';
import { formatBytes } from '@lib/helpers/formatBytes';
import { useData } from '@lib/hooks/useData';

import { Page } from '@components/layout/Page';
import { PageHeader } from '@components/layout/PageHeader';
import { PageContent } from '@components/layout/PageContent';
import { ConnectBaseModal } from '@components/bases/ConnectBaseModal';
import { BaseConnect } from '@components/bases/BaseConnect';

export function ConnectBasePage() {
  const history = useHistory();

  const {
    data, status, dispatch, error,
  } = useData();
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = async ({ isNew, ...payload }) => {
    setModalOpen(false);
    dispatch.pending();

    try {
      const response = isNew
        ? await createDatabase(payload)
        : await connectDatabase(payload);
      let content = '';

      if (!isNew && response.database.isTurbo && response.dbSize) {
        if (response.dbSize > MAX_SMALL_DATABASE_SIZE) {
          const bytes = response.dbSize * 1024;
          content = `It might take hours/days to import the database with the size of ${formatBytes(bytes)}`;
        }
      }

      dispatch.resolved({ base: response.database, content });
    } catch (err) {
      dispatch.rejected(err.response.data.exception || err.response.data.error);
    }

    setModalOpen(true);
  };

  const handleCancel = () => {
    history.push('/');
  };

  return (
    <Page authOnly>
      <div className="py-10">
        <PageHeader title="Add Database" className="text-center" />
        <PageContent className="mt-6">
          <BaseConnect
            loading={status === 'pending'}
            submit={handleSubmit}
            cancel={handleCancel}
          />
        </PageContent>
      </div>
      <ConnectBaseModal
        open={modalOpen}
        setOpen={setModalOpen}
        content={data?.content}
        base={data?.base}
        error={error}
      />
    </Page>
  );
}
