import React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { BasesProvider, useBases } from '@models/Bases';
import { BaseProvider, useBase } from '@models/Base';
import { BaseTableProvider } from '@models/BaseTable';
import { useAuthUser } from '@models/AuthUser';
import { BaseUserProvider, useBaseUser } from '@models/bases/BaseUser';
import { BaseGuestsProvider, useBaseGuests } from '@models/BaseGuests';
import { IId } from '@lib/propTypes/common';
import { useQuery } from '@lib/hooks/useQuery';

import { Page } from '@components/layout/Page';
import { Navbar } from '@components/layout/Navbar';
import { PageContent } from '@components/layout/PageContent';
import { AuthOnly } from '@components/middleware/AuthOnly';
import { Loader } from '@components/ui/Loader';
import { CurrentViewProvider } from '@models/views/CurrentTableView';
import { Table } from '@components/tables/Table';

const BaseTable = React.memo(({ id: tableId, baseId }) => {
  const query = useQuery();
  const history = useHistory();
  const viewId = query.get('view');
  const { authUser } = useAuthUser();
  const { data: bases } = useBases();
  const { data: base } = useBase();
  const { data: guests } = useBaseGuests();
  const { baseUser } = useBaseUser();

  if (base == null || bases == null || authUser == null || guests == null || typeof baseUser === 'undefined') {
    return <Loader className="h-screen" />;
  }

  if (!baseUser) {
    history.push('/login');
    return <Loader className="h-screen" />;
  }

  return (
    <Page
      navbar={<Navbar base={base} bases={bases} />}
      className="!bg-white"
    >
      <PageContent className="!px-0 max-w-full">
        <CurrentViewProvider
          baseId={baseId}
          initialTableId={tableId}
          initialViewId={viewId}
        >
          <Table />
        </CurrentViewProvider>
      </PageContent>
    </Page>
  );
});

BaseTable.propTypes = {
  id: IId.isRequired,
  baseId: IId.isRequired,
};

export function TablePage() {
  const { id, baseId } = useParams();

  return (
    <AuthOnly>
      <BasesProvider>
        <BaseProvider id={baseId}>
          <BaseGuestsProvider id={baseId}>
            <BaseUserProvider>
              <BaseTableProvider id={id}>
                <BaseTable id={id} baseId={baseId} />
              </BaseTableProvider>
            </BaseUserProvider>
          </BaseGuestsProvider>
        </BaseProvider>
      </BasesProvider>
    </AuthOnly>
  );
}
