import React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { BasesProvider, useBases } from '@models/Bases';
import { BaseProvider, useBase } from '@models/Base';
import { BaseTableProvider } from '@models/BaseTable';
import { useAuthUser } from '@models/AuthUser';
import { BaseUserProvider, useBaseUser } from '@models/BaseUser';
import { BaseGuestsProvider, useBaseGuests } from '@models/BaseGuests';
import { ViewFieldsProvider } from '@models/ViewFields';
import { CurrentViewProvider, useCurrentView } from '@models/views/CurrentTableView';
import { useQuery } from '@lib/hooks/useQuery';

import { Page } from '@components/layout/Page';
import { Navbar } from '@components/layout/Navbar';
import { PageContent } from '@components/layout/PageContent';
import { AuthOnly } from '@components/middleware/AuthOnly';
import { Loader } from '@components/ui/Loader';
import { Table } from '@components/tables/Table';
import { BasePermissionsModalProvider } from '@models/modals/BasePermissionsModal';
import { BasePermissionsModal } from '@components/permissions/BasePermissionsModal';

function BaseTable() {
  const history = useHistory();
  const { authUser } = useAuthUser();
  const { data: bases } = useBases();
  const { data: base } = useBase();
  const { data: guests } = useBaseGuests();
  const { data: baseUser } = useBaseUser();
  const { view } = useCurrentView();

  if (base == null || bases == null || authUser == null || guests == null || typeof baseUser === 'undefined') {
    return <Loader className="h-screen" />;
  }

  if (!baseUser) {
    history.push('/404');
    return <Loader className="h-screen" />;
  }

  return (
    <ViewFieldsProvider id={view?.id}>
      <BasePermissionsModalProvider>
        <Page
          navbar={<Navbar base={base} bases={bases} />}
          className="!bg-white"
        >
          <PageContent className="!px-0 max-w-full">
            <Table />
          </PageContent>
        </Page>
        <BasePermissionsModal />
      </BasePermissionsModalProvider>
    </ViewFieldsProvider>
  );
}

export function TablePage() {
  const { id: tableId, baseId } = useParams();
  const query = useQuery();
  const viewId = query.get('view');

  return (
    <AuthOnly>
      <BasesProvider>
        <BaseProvider id={baseId}>
          <BaseGuestsProvider id={baseId}>
            <BaseUserProvider>
              <BaseTableProvider id={tableId}>
                <CurrentViewProvider
                  baseId={baseId}
                  initialTableId={tableId}
                  initialViewId={viewId}
                >
                  <BaseTable id={tableId} baseId={baseId} />
                </CurrentViewProvider>
              </BaseTableProvider>
            </BaseUserProvider>
          </BaseGuestsProvider>
        </BaseProvider>
      </BasesProvider>
    </AuthOnly>
  );
}
