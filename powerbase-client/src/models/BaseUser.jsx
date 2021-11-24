import useSWR from 'swr';
import constate from 'constate';

import { useBase } from '@models/Base';
import { useAuthUser } from '@models/AuthUser';
import { getAuthGuestByDatabase } from '@lib/api/auth';
import { BasePermissions, ACCESS_LEVEL, CUSTOM_PERMISSIONS } from '@lib/constants/permissions';

function useBaseUserModel() {
  const { authUser } = useAuthUser();
  const { data: base } = useBase();

  const response = useSWR(
    (base && authUser) ? `/auth/databases/${base.id}/guest` : null,
    () => getAuthGuestByDatabase({ databaseId: base.id }),
  );

  const can = (permission, resource) => {
    const baseUser = response.data;

    if (!baseUser) return false;
    if (base.userId === baseUser.userId) return true;
    if (permission === 'changeGuestAccess' || permission === 'removeGuests') return false;

    const permissions = ACCESS_LEVEL.find((item) => item.name === baseUser.access)?.permisions;
    if (!permissions) return false;

    if (baseUser.access !== 'custom') {
      if (permissions.includes('all')) return true;
      if (permissions.includes(permission)) return true;

      if (BasePermissions.FIELD.includes(permission)) {
        const field = resource;

        if (field.permissions[permission].access === 'specific users only') {
          if (baseUser.access === 'creator') return true;
          if (field.permissions[permission].allowedRoles?.includes(baseUser.access)) return true;
        }
      }

      return false;
    }

    if (BasePermissions.BASE.includes(permission)) {
      let hasPermission = false;

      if (baseUser.permissions[permission]) {
        hasPermission = true;
      } else if (baseUser.permissions[permission] == null) {
        const basePermission = CUSTOM_PERMISSIONS.Base.find((item) => item.key === permission);
        if (basePermission) {
          hasPermission = basePermission.value;
        }
      }

      if (hasPermission && permission === 'inviteGuests' && resource) {
        const guest = resource;
        const access = ACCESS_LEVEL.find((item) => item.name === guest.access);
        const baseUserAccessLevel = ACCESS_LEVEL.find((item) => item.name === baseUser.access);

        if (baseUserAccessLevel >= access.level) {
          if (baseUser.access === 'custom') {
            if (guest.permissions.inviteGuests != null) {
              return guest.permissions.inviteGuests;
            }

            const basePermission = CUSTOM_PERMISSIONS.Base.find((item) => item.key === 'inviteGuests');
            return basePermission.value;
          }

          return true;
        }
      }

      return hasPermission;
    }

    if (BasePermissions.TABLE.includes(permission)) {
      if (baseUser.permissions.tables[resource]?.[permission]) return true;
      if (baseUser.permissions.tables[resource]?.[permission] == null) {
        const tablePermission = CUSTOM_PERMISSIONS.Table.find((item) => item.key === permission);
        if (tablePermission) return tablePermission.value;
      }
    }

    if (BasePermissions.FIELD.includes(permission)) {
      const field = resource;
      const fieldId = field.fieldId || field.id;

      if (baseUser.permissions.fields?.[fieldId]?.[permission]) return true;
      if (baseUser.permissions.fields?.[fieldId]?.[permission] == null) {
        const fieldPermission = CUSTOM_PERMISSIONS.Field.find((item) => item.key === permission);
        if (fieldPermission) return fieldPermission.value;
      }
    }

    return false;
  };

  return {
    ...response,
    authUser,
    baseUser: response.data
      ? {
        ...response.data,
        can,
      } : undefined,
    access: response.data?.permissions,
  };
}

export const [BaseUserProvider, useBaseUser] = constate(useBaseUserModel);
