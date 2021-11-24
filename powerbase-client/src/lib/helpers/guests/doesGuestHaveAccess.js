/**
 * Checks whether the guest have access to a certain resource.
 * @param {string} guestAccess Can either be creator, admin, editor, commenter, viewer or custom.
 * @param {string} resourceAccess Can either be everyone, commenters and up, editors and up, admins and up or creators only.
 * @returns boolean
 */
export function doesGuestHaveAccess(guestAccess, resourceAccess) {
  switch (resourceAccess) {
    case 'everyone':
      return true;
    case 'commenters and up':
      return guestAccess === 'commenter' || guestAccess === 'editor' || guestAccess === 'custom' || guestAccess === 'admin' || guestAccess === 'creator';
    case 'editors and up':
      return guestAccess === 'editor' || guestAccess === 'custom' || guestAccess === 'admin' || guestAccess === 'creator';
    case 'admins and up':
      return guestAccess === 'admin' || guestAccess === 'creator';
    case 'creators only':
      return guestAccess === 'creator';
    default:
      return false;
  }
}
