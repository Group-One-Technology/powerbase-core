export const ACCESS_LEVEL = [
  { name: 'owner', description: 'Has full access to this base and can share it with others.' },
  { name: 'custom', description: 'Configure your own permissions.' },
  { name: 'admin', description: 'Can configure tables, connections, and fields.' },
  { name: 'editor', description: 'Can edit records, and manage views but not configure the base.' },
  { name: 'commenter', description: 'Can comment and view data.', disabled: true },
  {
    name: 'viewer',
    description: 'Can only view the data.',
    value: {
      viewBase: true,
      viewTable: true,
      viewField: true,
      seeView: true,
    },
  },
];

export const CUSTOM_SIMPLE_PERMISSIONS = [
  {
    name: 'Can share with others.',
    value: { inviteGuests: true, removeAccess: true, changeGuestAccess: true },
  },
  {
    name: 'Can configure base, tables, and fields.',
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

export const CUSTOM_PERMISSIONS = {
  Table: [
    {
      name: 'View Table',
      description: 'who can see this table.',
      value: { viewTable: true },
    },
    {
      name: 'Manage Table',
      description: 'who can update table alias, reorder them, etc.',
      value: { manageTable: true },
    },
    {
      name: 'Add Records',
      value: { addRecords: true },
    },
    {
      name: 'Delete Records',
      value: { deleteRecords: true },
    },
    {
      name: 'Comment Records',
      description: 'who can add comments to the records.',
      value: { commentRecords: true },
      disabled: true,
    },
  ],
  Field: [
    {
      name: 'View Field',
      description: 'who can see this field.',
      value: { viewField: true },
    },
    {
      name: 'Manage Field',
      description: 'who can update the field type, set as PII, etc.',
      value: { manageField: true },
    },
    {
      name: 'Edit Field Data',
      description: 'who can update this specific field of the records.',
      value: { editFieldData: true },
    },
  ],
};
