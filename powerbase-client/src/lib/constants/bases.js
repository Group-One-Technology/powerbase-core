export const BASE_SOURCES = [
  {
    name: 'Fresh Base',
    description: 'Build out your table and data from scratch',
    footnote: 'Options: Postgres, MySQL',
    href: '/base/create',
  },
  {
    pretext: 'Connect Existing',
    name: 'Postgres',
    footnote: 'Connect to your existing postgres database',
    href: '/base/connect?adapter=postgresql',
  },
  {
    pretext: 'Connect Existing',
    name: 'MySQL',
    footnote: 'Connect to your existing mysql database',
    href: '/base/connect?adapter=mysql2',
  },
  {
    pretext: 'Import Existing',
    name: 'SQL Database from URL',
    footnote: 'Connect your existing mysql or postgres database',
    href: '/base/connect-url',
  },
  {
    name: 'Hubspot',
    description: 'Connect your Hubspot account',
    footnote: 'Campaigns, Companies, Contacts, Contact Lists, Deals, Deal Pipelines, Email Events, +3 More',
    href: '/base/integration/connect?type=hubspot',
  },
  {
    name: 'Shopify',
    description: 'Connect your Shopify account',
    footnote: 'Customers, Orders, Products, Abandoned Checkouts',
    href: '/base/integration/connect?type=shopify',
  },
];

export const NON_TURBO_REFRESH_INTERVAL = 5000; // milliseconds = 5 seconds
export const TURBO_REFRESH_INTERVAL = 600000; // milliseconds = 10 minutes
