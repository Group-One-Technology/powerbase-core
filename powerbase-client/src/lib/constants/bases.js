import { LightningBoltIcon, LockClosedIcon, SearchIcon } from '@heroicons/react/outline';

export const MAX_SMALL_DATABASE_SIZE = 1000000; // 976.56 KB

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

export const DATABASE_TYPES = [
  { name: 'PostgreSQL', value: 'postgresql', port: 5432 },
  { name: 'MySQL', value: 'mysql2', port: 3306 },
  {
    name: 'SQLite',
    value: 'sqlite',
    description: 'Coming Soon',
    disabled: true,
  },
];

export const DB_PLATFORMS = [
  { name: 'Powerbase Cloud', description: 'A free cloud platform powered by Powerbase.', price: '$0' },
  { name: 'AWS', description: 'Coming Soon', disabled: true },
];

export const POWERBASE_TYPE = [
  {
    nameId: 'turbo_title',
    descriptionId: 'turbo_description',
    name: 'Powerbase Turbo',
    description: 'Use Turbo to navigate tens or hundreds of millions of records instantly.',
    features: [
      {
        nameId: 'cnk_c7554b55009b5af0cb58',
        descriptionId: 'cnk_6c9d5cfdf37ced4096aa',
        name: 'Quickly navigate data',
        description: 'Consequuntur omnis dicta cumque, inventore atque ab dolores aspernatur tempora ab doloremque.',
        icon: LightningBoltIcon,
      },
      {
        nameId: 'cnk_910382eec24c612597c1',
        descriptionId: 'cnk_cbbb6b319c0d6e4ea7b0',
        name: 'Full text search',
        description: 'Consequuntur omnis dicta cumque, inventore atque ab dolores aspernatur tempora ab doloremque.',
        icon: SearchIcon,
      },
    ],
  },
  {
    nameId: 'non_turbo_title',
    descriptionId: 'non_turbo_description',
    name: 'Regular Database',
    description: 'Use your imported or newly created database in navigating records.',
    features: [
      {
        nameId: 'cnk_36ba450dbbd4421ba232',
        descriptionId: 'cnk_d7d6b06ecffad59ac0fd',
        name: 'Data is stored where you want it to be.',
        description: 'Consequuntur omnis dicta cumque, inventore atque ab dolores aspernatur tempora ab doloremque.',
        icon: LockClosedIcon,
      },
    ],
  },
];
