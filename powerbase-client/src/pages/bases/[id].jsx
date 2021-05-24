import React, { useEffect } from 'react';
import useSWR from 'swr';
import { useParams } from 'react-router-dom';

import { getDatabase } from '@lib/api/databases';
import { Page } from '@components/layout/Page';
import { PageHeader } from '@components/layout/PageHeader';
import { Navbar } from '@components/layout/Navbar';
import { PageContent } from '@components/layout/PageContent';

export function BasePage() {
  const { id } = useParams();
  const { data: base } = useSWR(id ? `/databases/${id}` : null, () => getDatabase({ id }));

  return (
    <Page navbar={<Navbar base={base} />} className="!bg-white" authOnly>
      <div className="py-10 ">
        <PageContent className="bg-white">
          sdfds
        </PageContent>
      </div>
    </Page>
  );
}
