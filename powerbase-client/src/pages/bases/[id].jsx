import React from 'react';
import useSWR from 'swr';
import { useParams } from 'react-router-dom';
import cn from 'classnames';

import { getDatabase, getDatabases } from '@lib/api/databases';
import { useAuthUser } from '@models/AuthUser';
import { Page } from '@components/layout/Page';
import { Navbar } from '@components/layout/Navbar';
import { PageContent } from '@components/layout/PageContent';
import { TableTabs } from '@components/tables/TableTabs';
import { BG_COLORS } from '@lib/constants';

export function BasePage() {
  const { id } = useParams();
  const { authUser } = useAuthUser();
  const { data: bases } = useSWR(authUser ? '/databases' : null, getDatabases);
  const { data: base } = useSWR(id ? `/databases/${id}` : null, () => getDatabase({ id }));

  if (base == null) {
    return null;
  }

  return (
    <Page navbar={<Navbar base={base} bases={bases} />} className="!bg-white" authOnly>
      <PageContent className={cn('!px-0 max-w-full', BG_COLORS[base.color])}>
        <TableTabs />
      </PageContent>
    </Page>
  );
}
