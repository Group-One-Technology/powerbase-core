export const BASE_PERMISSIONS = {
  Base: ['viewBase', 'manageBase', 'inviteGuests', 'changeGuestAccess', 'removeGuests', 'addTables', 'deleteTables'],
  Table: ['viewTable', 'manageTable', 'manageViews', 'addViews', 'deleteViews', 'addFields', 'deleteFields', 'addRecords', 'deleteRecords', 'commentRecords'],
  Field: ['viewField', 'manageField', 'editFieldData'],
};

export const PERMISSIONS = {
  ViewBase: 'viewBase',
  ManageBase: 'manageBase',
  InviteGuests: 'inviteGuests',
  ChangeGuestAccess: 'changeGuestAccess',
  RemoveGuests: 'removeGuests',
  AddTables: 'addTables',
  DeleteTables: 'deleteTables',
  ViewTable: 'viewTable',
  ManageTable: 'manageTable',
  ManageViews: 'manageViews',
  AddViews: 'addViews',
  DeleteViews: 'deleteViews',
  AddFields: 'addFields',
  DeleteFields: 'deleteFields',
  AddRecords: 'addRecords',
  DeleteRecords: 'deleteRecords',
  CommentRecords: 'commentRecords',
  ViewField: 'viewField',
  ManageField: 'manageField',
  EditFieldData: 'editFieldData',
};

export const ACCESS_LEVEL = [
  {
    name: 'creator',
    description: 'Has full access to this base and can share it with others.',
    permisions: ['all'],
    level: 6,
  },
  {
    name: 'admin',
    description: 'Can configure tables, connections, and fields.',
    permisions: ['viewBase', ...BASE_PERMISSIONS.Table, ...BASE_PERMISSIONS.Field],
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
    name: 'creators only',
    access: ['creator'],
  },
  {
    name: 'specific users only',
    access: ['creator'],
  },
  {
    name: 'admins and up',
    access: ['creator', 'admin'],
  },
  {
    name: 'editors and up',
    access: ['creator', 'admin', 'custom', 'editor'],
  },
  {
    name: 'commenters and up',
    access: ['creator', 'admin', 'custom', 'editor', 'commenter'],
  },
  {
    name: 'everyone',
    access: ['creator', 'admin', 'custom', 'editor', 'commenter', 'viewer'],
  },
];

export const CUSTOM_PERMISSIONS = {
  Base: [
    {
      name: 'View Base',
      description: 'who can see this base.',
      key: 'viewBase',
      access: 'everyone',
      value: true,
      hidden: true,
    },
    {
      name: 'Manage Base',
      description: 'who can configure the base remote DB connection, reorder tables, update table aliases, etc.',
      key: 'manageBase',
      access: 'creators only',
      value: false,
    },
    {
      name: 'Invite Guests',
      description: 'who can send invites to users.',
      access: 'creators only',
      key: 'inviteGuests',
      value: false,
    },
    {
      name: 'Add Tables',
      description: 'who can create a table for this base.',
      access: 'admins and up',
      key: 'addTables',
      value: false,
    },
    {
      name: 'Delete Tables',
      description: 'who can drop a table for this base.',
      access: 'admins and up',
      key: 'deleteTables',
      value: false,
    },
  ],
  Table: [
    {
      name: 'View Table',
      description: 'who can see this table.',
      access: 'everyone',
      key: 'viewTable',
      value: true,
    },
    {
      name: 'Manage Table',
      description: 'who can update the table permissions, etc.',
      access: 'admins and up',
      key: 'manageTable',
      value: false,
    },
    {
      name: 'Add Fields',
      description: 'who can create an actual field and magic field for this table.',
      access: 'admins and up',
      key: 'addFields',
      value: false,
    },
    {
      name: 'Delete Fields',
      description: 'who can drop a column/field for this table.',
      access: 'admins and up',
      key: 'deleteFields',
      value: false,
    },
    {
      name: 'Add Views',
      description: 'who can create collaborative views for this table.',
      access: 'editors and up',
      key: 'addViews',
      value: true,
    },
    {
      name: 'Manage Views',
      description: 'who can update the filter, sort, resize/reorder fields, etc.',
      access: 'editors and up',
      key: 'manageViews',
      value: true,
    },
    {
      name: 'Delete Views',
      description: 'who can delete collaborative views for this table.',
      access: 'editors and up',
      key: 'deleteViews',
      value: true,
    },
    {
      name: 'Add Records',
      description: 'who can add and edit records for this table.',
      access: 'editors and up',
      key: 'addRecords',
      value: true,
    },
    {
      name: 'Delete Records',
      description: 'who can delete records for this table.',
      access: 'editors and up',
      key: 'deleteRecords',
      value: true,
    },
    {
      name: 'Comment Records',
      description: 'who can add comments to the records.',
      access: 'commenters and up',
      key: 'commentRecords',
      value: true,
      disabled: true,
    },
  ],
  Field: [
    {
      name: 'View Field',
      description: 'who can see this field.',
      access: 'everyone',
      key: 'viewField',
      value: true,
    },
    {
      name: 'Manage Field',
      description: 'who can update the alias and/or field type, set as PII, update the permissions etc.',
      access: 'admins and up',
      key: 'manageField',
      value: false,
    },
    {
      name: 'Edit Field Data',
      description: 'who can update this specific field of the records.',
      access: 'editors and up',
      key: 'editFieldData',
      value: true,
    },
  ],
};
