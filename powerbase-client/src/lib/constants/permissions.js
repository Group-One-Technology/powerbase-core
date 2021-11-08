export const ACCESS_LEVEL = [
  { name: 'owner', description: 'Has full access to this base and can share it with others.' },
  { name: 'custom', description: 'Configure your own permissions.' },
  { name: 'admin', description: 'Can configure tables, connections, and fields.' },
  { name: 'editor', description: 'Can edit records, and manage views but not configure the base.' },
  { name: 'commenter', description: 'Can comment and view data.', disabled: true },
  { name: 'viewer', description: 'Can only view the data.' },
];

export const CUSTOM_SIMPLE_PERMISSIONS = [
  {
    name: 'Can share with others.',
    value: { inviteGuests: true, removeAccess: true, changeGuestAccess: true },
  },
  {
    name: 'Can configure base, tables, fields.',
    value: {
      manageBase: true,
      addTable: true,
      manageTable: true,
      addFields: true,
    },
  },
  {
    name: 'Can edit records and views.',
    value: { manageView: true, addRecords: true, deleteRecords: true },
  },
  {
    name: 'Can comment',
    value: { commentRecords: true },
  },
];
