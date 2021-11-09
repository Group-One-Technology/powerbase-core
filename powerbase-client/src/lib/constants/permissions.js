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
  Base: [
    {
      name: 'Manage Base',
      description: 'who can configure the base remote DB connection.',
      value: { manageBase: true },
      defaultValue: false,
    },
    {
      name: 'Invite Guests',
      description: 'who can send invites to users.',
      value: { inviteGuests: true },
      defaultValue: false,
    },
    {
      name: 'Change Guest Access',
      description: 'who can change guest\'s access level and permissions.',
      value: { changeGuestAccess: true },
      defaultValue: false,
    },
    {
      name: 'Remove Guest Access',
      description: 'who can remove a guest from this base.',
      value: { removeGuestAccess: true },
      defaultValue: false,
    },
    {
      name: 'Add Tables',
      value: { addTables: true },
      description: 'who can create a table for this base.',
      defaultValue: true,
    },
    {
      name: 'Delete Tables',
      value: { deleteTables: true },
      description: 'who can drop a table for this base.',
      defaultValue: false,
    },
  ],
  Table: [
    {
      name: 'View Table',
      description: 'who can see this table.',
      value: { viewTable: true },
      defaultValue: true,
    },
    {
      name: 'Manage Table',
      description: 'who can update table alias, reorder them, etc.',
      value: { manageTable: true },
      defaultValue: false,
    },
    {
      name: 'Add Views',
      value: { addViews: true },
      description: 'who can create collaborative views for this table.',
      defaultValue: true,
    },
    {
      name: 'Manage Views',
      description: 'who can update the filter, sort, resize/reorder fields, etc.',
      value: { manageViews: true },
      defaultValue: true,
    },
    {
      name: 'Delete Views',
      value: { deleteViews: true },
      description: 'who can delete collaborative views for this table.',
      defaultValue: true,
    },
    {
      name: 'Add Records',
      value: { addRecords: true },
      description: 'who can add and edit records for this table.',
      defaultValue: true,
    },
    {
      name: 'Delete Records',
      value: { deleteRecords: true },
      description: 'who can delete records for this table.',
      defaultValue: true,
    },
    {
      name: 'Add Fields',
      value: { addFields: true },
      description: 'who can create an actual field and magic field for this table.',
      defaultValue: true,
    },
    {
      name: 'Delete Fields',
      value: { deleteFields: true },
      description: 'who can drop a column/field for this table.',
      defaultValue: false,
    },
    {
      name: 'Comment Records',
      description: 'who can add comments to the records.',
      value: { commentRecords: true },
      disabled: true,
      defaultValue: true,
    },
  ],
  Field: [
    {
      name: 'View Field',
      description: 'who can see this field.',
      value: { viewField: true },
      defaultValue: true,
    },
    {
      name: 'Manage Field',
      description: 'who can update the alias and/or field type, set as PII, etc.',
      value: { manageField: true },
      defaultValue: false,
    },
    {
      name: 'Edit Field Data',
      description: 'who can update this specific field of the records.',
      value: { editFieldData: true },
      defaultValue: true,
    },
  ],
};
