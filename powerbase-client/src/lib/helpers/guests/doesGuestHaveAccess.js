/**
 * Checks whether the guest have access to a certain resource.
 * @param {string} role Can either be creator, admin, editor, commenter, viewer or custom.
 * @param {string} access Can either be everyone, commenters and up, editors and up, admins and up or creators only.
 * @returns boolean
 */
export function doesGuestHaveAccess(role, access) {
  switch (access) {
    case 'everyone':
      return true;
    case 'commenters and up':
      return role === 'commenter' || role === 'editor' || role === 'custom' || role === 'admin' || role === 'creator';
    case 'editors and up':
      return role === 'editor' || role === 'custom' || role === 'admin' || role === 'creator';
    case 'admins and up':
      return role === 'admin' || role === 'creator';
    case 'creators only':
      return role === 'creator';
    default:
      return false;
  }
}
