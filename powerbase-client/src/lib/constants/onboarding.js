export const BASE_SOURCES = [
  {
    name: 'Fresh Base',
    description: 'Build out your table and data from scratch',
    footnote: 'Options: Postgres, MySQL',
    value: 'create',
    disabled: true,
  },
  {
    pretext: 'Connect Existing',
    name: 'SQL Database',
    footnote: 'Connect your existing mysql or postgres database',
    value: 'existing',
  },
  {
    pretext: 'Start with',
    name: 'Sample Database',
    footnote: 'Try out Powerbase with our sample IMDB database.',
    value: 'sample',
  },
];

export const OnboardingTabs = {
  SETUP_DATABASE: 'setup database',
  CONNECT_DATABASE: 'connect database',
  INVITE_GUESTS: 'invite guests',
};
