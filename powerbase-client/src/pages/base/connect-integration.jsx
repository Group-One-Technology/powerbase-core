import React from 'react';
import { useQuery } from '@lib/hooks/useQuery';

import { Page } from '@components/layout/Page';
import { PageHeader } from '@components/layout/PageHeader';
import { PageContent } from '@components/layout/PageContent';
import { ConnectHubspotForm } from '@components/integrations/ConnectHubspotForm';
import { ConnectShopifyForm } from '@components/integrations/ConnectShopifyForm';

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
        <PageHeader className="text-center">
          Connect {BASE_INTEGRATION[integrationType].name} Account
        </PageHeader>
        <PageContent className="mt-6">
          {BASE_INTEGRATION[integrationType].component}
        </PageContent>
      </div>
    </Page>
  );
}
