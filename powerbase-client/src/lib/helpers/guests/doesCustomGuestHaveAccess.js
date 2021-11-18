/**
 * Checks whether the guest with "custom" role have access to a certain resource.
 * @param {string} access Can either be everyone, commenters and up, editors and up, admins and up or creators only.
 * @returns boolean
 */
export function doesCustomGuestHaveAccess(access) {
  switch (access) {
    case 'everyone': return true;
    case 'commenters and up': return true;
    case 'editors and up': return true;
    default: return false;
  }
}
