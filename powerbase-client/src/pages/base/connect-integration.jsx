import React from 'react';
import { useQuery } from '@lib/hooks/useQuery';

import { Page } from '@components/layout/Page';
import { PageHeader } from '@components/layout/PageHeader';
import { PageContent } from '@components/layout/PageContent';
import { ConnectHubspotForm } from '@components/bases/ConnectHubspotForm';
import { ConnectShopifyForm } from '@components/bases/ConnectShopifyForm';

const BASE_INTEGRATION = {
  hubspot: {
    name: 'Hubspot',
    component: <ConnectHubspotForm />,
  },
  shopify: {
    name: 'Shopify',
    component: <ConnectShopifyForm />,
  },
};

export function ConnectIntegrationBasePage() {
  const query = useQuery();
  const integrationType = query.get('type');

  return (
    <Page authOnly>
      <div className="py-10">
        <PageHeader title={`Connect ${BASE_INTEGRATION[integrationType].name} Account`} className="text-center" />
        <PageContent className="mt-6">
          {BASE_INTEGRATION[integrationType].component}
        </PageContent>
      </div>
    </Page>
  );
}
