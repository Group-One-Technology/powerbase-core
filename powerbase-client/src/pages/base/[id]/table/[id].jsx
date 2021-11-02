import React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { BasesProvider, useBases } from '@models/Bases';
import { BaseProvider, useBase } from '@models/Base';
import { BaseTableProvider } from '@models/BaseTable';
import { useAuthUser } from '@models/AuthUser';
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

  if (base == null || bases == null || authUser == null || guests == null) {
    return <Loader className="h-screen" />;
  }

  if (base.userId !== authUser.id) {
    const guest = guests.find((item) => item.userId === authUser.id);

    if (!guest) {
      history.push('/login');
      return <Loader className="h-screen" />;
    }
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
    <BasesProvider>
      <BaseProvider id={baseId}>
        <BaseGuestsProvider id={baseId}>
          <BaseTableProvider id={id}>
            <AuthOnly>
              <BaseTable id={id} baseId={baseId} />
            </AuthOnly>
          </BaseTableProvider>
        </BaseGuestsProvider>
      </BaseProvider>
    </BasesProvider>
  );
}
