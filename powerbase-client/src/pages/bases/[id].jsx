import React from 'react';
import useSWR from 'swr';
import { useParams } from 'react-router-dom';

import { getDatabase, getDatabases } from '@lib/api/databases';
import { useAuthUser } from '@models/AuthUser';
import { Page } from '@components/layout/Page';
import { Navbar } from '@components/layout/Navbar';
import { PageContent } from '@components/layout/PageContent';

export function BasePage() {
  const { id } = useParams();
  const { authUser } = useAuthUser();
  const { data: bases } = useSWR(authUser ? '/databases' : null, getDatabases);
  const { data: base } = useSWR(id ? `/databases/${id}` : null, () => getDatabase({ id }));

  return (
    <Page navbar={<Navbar base={base} bases={bases} />} className="!bg-white" authOnly>
      <div className="py-10 ">
        <PageContent className="bg-white">
          {base?.name}
        </PageContent>
      </div>
    </Page>
  );
}
