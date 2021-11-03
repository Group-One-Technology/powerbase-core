export const ACCESS_LEVEL = [
  { name: 'owner', description: 'Has full access to this base and can share it with others.' },
  { name: 'admin', description: 'Can configure tables, connections, and fields.' },
  { name: 'editor', description: 'Can edit records, and manage views but not configure the base.' },
  { name: 'commenter', description: 'Can comment and view data.', disabled: true },
  { name: 'viewer', description: 'Can only view the data.' },
];
