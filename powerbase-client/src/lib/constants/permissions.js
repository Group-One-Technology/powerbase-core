export const BasePermissions = {
  BASE: ['viewBase', 'manageBase', 'inviteGuests', 'changeGuestAccess', 'removeGuests', 'addTables', 'deleteTables'],
  TABLE: ['viewTable', 'manageTable', 'manageViews', 'addViews', 'deleteViews', 'addFields', 'deleteFields', 'addRecords', 'deleteRecords', 'commentRecords'],
  FIELD: ['viewField', 'manageField', 'editFieldData'],
};

export const ACCESS_LEVEL = [
  {
    name: 'owner',
    description: 'Has full access to this base and can share it with others.',
    permisions: ['all'],
    level: 6,
  },
  {
    name: 'admin',
    description: 'Can configure tables, connections, and fields.',
    permisions: ['viewBase', ...BasePermissions.TABLE, ...BasePermissions.FIELD],
    level: 5,
  },
  {
    name: 'custom',
    description: 'Configure your own permissions. It has the Editor\'s permissions as default.',
    permisions: ['viewBase', 'addViews', 'manageViews', 'deleteViews', 'addFields', 'addRecords', 'deleteRecords', 'commentRecords'],
    level: 4,
  },
  {
    name: 'editor',
    description: 'Can edit records, and manage views but not configure the base.',
    permisions: ['viewBase', 'addViews', 'manageViews', 'deleteViews', 'addFields', 'addRecords', 'deleteRecords', 'commentRecords'],
    level: 3,
  },
  {
    name: 'commenter',
    description: 'Can comment and view data.',
    permisions: ['viewBase', 'viewTable', 'viewField', 'commentRecords'],
    level: 2,
  },
  {
    name: 'viewer',
    description: 'Can only view the data.',
    permisions: ['viewBase', 'viewTable', 'viewField'],
    level: 1,
  },
];

export const GROUP_ACCESS_LEVEL = [
  {
    name: 'owners only',
    access: ['owner'],
  },
  {
    name: 'admins and up',
    access: ['owner', 'admin'],
  },
  {
    name: 'editors and up',
    access: ['owner', 'admin', 'custom', 'editor'],
  },
  {
    name: 'commenters and up',
    access: ['owner', 'admin', 'custom', 'editor', 'commenter'],
  },
  {
    name: 'everyone',
    access: ['owner', 'admin', 'custom', 'editor', 'commenter', 'viewer'],
  },
];

export const CUSTOM_PERMISSIONS = {
  Base: [
    {
      name: 'View Base',
      description: 'who can see this base.',
      key: 'viewBase',
      value: true,
      hidden: true,
    },
    {
      name: 'View Table',
      description: 'who can view all the tables of this base.',
      key: 'viewTable',
      value: true,
      hidden: true,
    },
    {
      name: 'View Field',
      description: 'who can view all the fields of this base.',
      key: 'viewField',
      value: true,
      hidden: true,
    },
    {
      name: 'Manage Base',
      description: 'who can configure the base remote DB connection, reorder tables, update table aliases, etc.',
      key: 'manageBase',
      value: false,
    },
    {
      name: 'Invite Guests',
      description: 'who can send invites to users.',
      key: 'inviteGuests',
      value: false,
    },
    {
      name: 'Add Tables',
      description: 'who can create a table for this base.',
      key: 'addTables',
      value: false,
    },
    {
      name: 'Delete Tables',
      description: 'who can drop a table for this base.',
      key: 'deleteTables',
      value: false,
    },
  ],
  Table: [
    {
      name: 'View Table',
      description: 'who can see this table.',
      key: 'viewTable',
      value: true,
    },
    {
      name: 'Manage Table',
      description: 'who can update the table permissions, etc.',
      key: 'manageTable',
      value: false,
    },
    {
      name: 'Add Fields',
      description: 'who can create an actual field and magic field for this table.',
      key: 'addFields',
      value: false,
    },
    {
      name: 'Delete Fields',
      description: 'who can drop a column/field for this table.',
      key: 'deleteFields',
      value: false,
    },
    {
      name: 'Add Views',
      description: 'who can create collaborative views for this table.',
      key: 'addViews',
      value: true,
    },
    {
      name: 'Manage Views',
      description: 'who can update the filter, sort, resize/reorder fields, etc.',
      key: 'manageViews',
      value: true,
    },
    {
      name: 'Delete Views',
      description: 'who can delete collaborative views for this table.',
      key: 'deleteViews',
      value: true,
    },
    {
      name: 'Add Records',
      description: 'who can add and edit records for this table.',
      key: 'addRecords',
      value: true,
    },
    {
      name: 'Delete Records',
      description: 'who can delete records for this table.',
      key: 'deleteRecords',
      value: true,
    },
    {
      name: 'Comment Records',
      description: 'who can add comments to the records.',
      key: 'commentRecords',
      value: true,
      disabled: true,
    },
  ],
  Field: [
    {
      name: 'View Field',
      description: 'who can see this field.',
      key: 'viewField',
      value: true,
    },
    {
      name: 'Manage Field',
      description: 'who can update the alias and/or field type, set as PII, update the permissions etc.',
      key: 'manageField',
      value: false,
    },
    {
      name: 'Edit Field Data',
      description: 'who can update this specific field of the records.',
      key: 'editFieldData',
      value: true,
    },
  ],
};
